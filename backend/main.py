from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import asyncio
import json
import time
import random
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from email_service import send_automated_report

app = FastAPI(title="DevForge BI Engine", version="1.0.0")

# Allow requests from the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_origin_regex="https://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "DevForge BI Python Engine is running."}

@app.post("/api/upload")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith(('.csv', '.xlsx')):
        raise HTTPException(status_code=400, detail="Invalid file format. Only CSV and Excel are supported.")
    
    try:
        contents = await file.read()
        
        # Load data into Pandas
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
            
        # Basic Dataset Understanding
        summary = {
            "filename": file.filename,
            "rows": len(df),
            "columns": len(df.columns),
            "column_names": list(df.columns),
            "data_types": {col: str(dtype) for col, dtype in df.dtypes.items()},
            "preview_html": df.head(5).to_html(classes="table table-striped"),
        }
        
        # Detect numeric columns for stats
        numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
        if numeric_cols:
            stats = df[numeric_cols].describe().to_dict()
            summary["basic_stats"] = stats
            
        return {"success": True, "dataset": summary}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/clean")
async def clean_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith(('.csv', '.xlsx')):
        raise HTTPException(status_code=400, detail="Invalid file format.")
    
    try:
        contents = await file.read()
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
            
        initial_rows = len(df)
        
        # 1. Remove duplicate rows
        df.drop_duplicates(inplace=True)
        
        # 2. Handle missing values
        # Numeric columns: fill with median
        numeric_cols = df.select_dtypes(include=['number']).columns
        for col in numeric_cols:
            df[col].fillna(df[col].median(), inplace=True)
            
        # Categorical columns: fill with mode
        cat_cols = df.select_dtypes(include=['object']).columns
        for col in cat_cols:
            if not df[col].mode().empty:
                df[col].fillna(df[col].mode()[0], inplace=True)
                
        final_rows = len(df)
        
        # Convert back to CSV to return to user or save
        cleaned_csv = df.to_csv(index=False)
        
        return {
            "success": True, 
            "message": "Data cleaned successfully",
            "stats": {
                "initial_rows": initial_rows,
                "final_rows": final_rows,
                "duplicates_removed": initial_rows - final_rows
            },
            "preview": df.head(5).to_dict(orient="records")
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, mean_squared_error
import numpy as np

@app.post("/api/train")
async def train_model(target_column: str, file: UploadFile = File(...)):
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents)) if file.filename.endswith('.csv') else pd.read_excel(io.BytesIO(contents))
        
        if target_column not in df.columns:
            raise HTTPException(status_code=400, detail=f"Target column '{target_column}' not found in dataset.")
            
        # Drop rows where target is missing
        df = df.dropna(subset=[target_column])
        
        # Select numeric features only for simplicity in this MVP
        features = df.select_dtypes(include=['number']).drop(columns=[target_column], errors='ignore')
        target = df[target_column]
        
        # Fill missing in features
        features = features.fillna(features.median())
        
        X_train, X_test, y_train, y_test = train_test_split(features, target, test_size=0.2, random_state=42)
        
        # Determine task type (Regression vs Classification)
        if pd.api.types.is_numeric_dtype(target) and len(target.unique()) > 10:
            # Regression Task
            model = RandomForestRegressor(n_estimators=100, random_state=42)
            model.fit(X_train, y_train)
            preds = model.predict(X_test)
            score = np.sqrt(mean_squared_error(y_test, preds))
            metric = "RMSE"
            task = "Regression"
        else:
            # Classification Task
            model = RandomForestClassifier(n_estimators=100, random_state=42)
            model.fit(X_train, y_train)
            preds = model.predict(X_test)
            score = accuracy_score(y_test, preds)
            metric = "Accuracy"
            task = "Classification"
            
        return {
            "success": True,
            "task_type": task,
            "model_used": "RandomForest",
            "metric": metric,
            "score": float(score),
            "feature_importance": dict(zip(features.columns, model.feature_importances_.tolist()))
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/dashboard")
async def generate_dashboard(file: UploadFile = File(...)):
    if not file.filename.endswith(('.csv', '.xlsx')):
        raise HTTPException(status_code=400, detail="Invalid file format.")
    
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents)) if file.filename.endswith('.csv') else pd.read_excel(io.BytesIO(contents))
        
        dashboard_data = {}
        numeric_df = df.select_dtypes(include=['number']).fillna(0)
        
        # 1. Correlation Matrix
        if not numeric_df.empty:
            corr_matrix = numeric_df.corr().round(2).to_dict()
            dashboard_data["correlations"] = corr_matrix
            
            # 2. Distributions (Histograms) for top 4 numeric columns
            top_cols = numeric_df.columns[:4]
            distributions = {}
            for col in top_cols:
                # Use 10 bins for simple histogram
                counts, bins = np.histogram(numeric_df[col], bins=10)
                distributions[col] = {
                    "bins": np.round(bins, 2).tolist(),
                    "counts": counts.tolist()
                }
            dashboard_data["distributions"] = distributions
            
        # 3. Categorical Value Counts (Top 5 per column) for top 2 categorical columns
        cat_df = df.select_dtypes(include=['object', 'category'])
        if not cat_df.empty:
            cat_counts = {}
            for col in cat_df.columns[:2]:
                counts = cat_df[col].value_counts().head(5).to_dict()
                cat_counts[col] = counts
            dashboard_data["categorical_counts"] = cat_counts
            
        # 4. Scatter Plot Data (First two numeric columns)
        if numeric_df.shape[1] >= 2:
            col1, col2 = numeric_df.columns[0], numeric_df.columns[1]
            scatter_data = numeric_df[[col1, col2]].head(100).to_dict(orient='records')
            dashboard_data["scatter"] = {"x": col1, "y": col2, "data": scatter_data}
            
        # 5. Trend Line Data (First numeric column over index)
        if numeric_df.shape[1] >= 1:
            col1 = numeric_df.columns[0]
            trend_data = [{"index": i, "value": val} for i, val in enumerate(numeric_df[col1].head(50))]
            dashboard_data["trend"] = {"name": col1, "data": trend_data}
            
        return {
            "success": True,
            "dashboard": dashboard_data
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

import plotly.express as px
import plotly.graph_objects as go
import json

@app.post("/api/powerbi")
async def generate_powerbi_charts(file: UploadFile = File(...)):
    if not file.filename.endswith(('.csv', '.xlsx')):
        raise HTTPException(status_code=400, detail="Invalid file format.")
    
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents)) if file.filename.endswith('.csv') else pd.read_excel(io.BytesIO(contents))
        
        charts = {}
        numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
        cat_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
        
        if not numeric_cols:
            raise HTTPException(status_code=400, detail="Dataset must contain at least one numeric column for charts.")
            
        def fig_to_dict(fig):
            return json.loads(fig.to_json())

        # 1. Bar Chart (Top 10 of first categorical vs first numeric)
        if cat_cols and len(numeric_cols) > 0:
            agg_df = df.groupby(cat_cols[0])[numeric_cols[0]].sum().reset_index().sort_values(by=numeric_cols[0], ascending=False).head(10)
            fig = px.bar(agg_df, x=cat_cols[0], y=numeric_cols[0], title=f"Top 10 {cat_cols[0]} by {numeric_cols[0]}")
            charts["bar"] = fig_to_dict(fig)
            
            # 2. Pie Chart
            fig = px.pie(agg_df, names=cat_cols[0], values=numeric_cols[0], title=f"Distribution of {numeric_cols[0]}")
            charts["pie"] = fig_to_dict(fig)
            
            # 3. Donut Chart
            fig = px.pie(agg_df, names=cat_cols[0], values=numeric_cols[0], hole=0.5, title=f"Donut: {numeric_cols[0]}")
            charts["donut"] = fig_to_dict(fig)
            
            # 4. Treemap (Requires positive values)
            agg_df_pos = agg_df[agg_df[numeric_cols[0]] > 0]
            if not agg_df_pos.empty:
                fig = px.treemap(agg_df_pos, path=[cat_cols[0]], values=numeric_cols[0], title="Treemap")
                charts["treemap"] = fig_to_dict(fig)

        # 5. Line/Area Chart (Trend over index or time) + Forecasting & Anomalies
        trend_df = df.head(100).reset_index()
        
        # Anomaly Detection (Z-Score)
        mean_val = trend_df[numeric_cols[0]].mean()
        std_val = trend_df[numeric_cols[0]].std()
        trend_df['is_anomaly'] = (trend_df[numeric_cols[0]] - mean_val).abs() > (2 * std_val)
        
        fig_line = px.line(trend_df, x='index', y=numeric_cols[0], title="Line Trend (with Anomalies & Forecast)")
        
        # Add Anomaly scatter points
        anomalies = trend_df[trend_df['is_anomaly']]
        if not anomalies.empty:
            fig_line.add_trace(go.Scatter(
                x=anomalies['index'], y=anomalies[numeric_cols[0]],
                mode='markers', marker=dict(color='red', size=10, symbol='x'),
                name='Anomaly'
            ))
            
        # Add Forecast (Simple Linear Trend extension)
        if len(trend_df) > 5:
            x_vals = np.arange(len(trend_df))
            y_vals = trend_df[numeric_cols[0]].fillna(mean_val).values
            coef = np.polyfit(x_vals, y_vals, 1)
            poly1d_fn = np.poly1d(coef)
            
            future_x = np.arange(len(trend_df), len(trend_df) + 20)
            future_y = poly1d_fn(future_x)
            
            fig_line.add_trace(go.Scatter(
                x=future_x, y=future_y,
                mode='lines', line=dict(color='orange', dash='dot'),
                name='Forecast'
            ))

        charts["line"] = fig_to_dict(fig_line)
        
        fig_area = px.area(trend_df, x='index', y=numeric_cols[0], title="Area Trend")
        charts["area"] = fig_to_dict(fig_area)

        # 6. Scatter Plot
        if len(numeric_cols) >= 2:
            fig = px.scatter(df.head(200), x=numeric_cols[0], y=numeric_cols[1], title=f"{numeric_cols[0]} vs {numeric_cols[1]}")
            charts["scatter"] = fig_to_dict(fig)
            
            # 7. Heatmap (Correlation Matrix)
            corr = df[numeric_cols].corr()
            fig = px.imshow(corr, text_auto=True, title="Correlation Heatmap")
            charts["heatmap"] = fig_to_dict(fig)
            
            # 11. Radar Chart (for top 5 records across top 5 numeric cols)
            if len(numeric_cols) >= 3 and len(cat_cols) > 0:
                radar_cols = numeric_cols[:5]
                radar_df = df.head(5)
                fig_radar = go.Figure()
                for i, row in radar_df.iterrows():
                    fig_radar.add_trace(go.Scatterpolar(
                        r=row[radar_cols].fillna(0).values,
                        theta=radar_cols,
                        fill='toself',
                        name=str(row[cat_cols[0]])
                    ))
                fig_radar.update_layout(polar=dict(radialaxis=dict(visible=True)), title="Radar Comparison")
                charts["radar"] = fig_to_dict(fig_radar)

        # 12. Gauge Chart (KPI)
        if len(numeric_cols) > 0:
            kpi_val = df[numeric_cols[0]].mean()
            max_val = df[numeric_cols[0]].max()
            fig_gauge = go.Figure(go.Indicator(
                mode="gauge+number",
                value=kpi_val,
                domain={'x': [0, 1], 'y': [0, 1]},
                title={'text': f"Average {numeric_cols[0]}"},
                gauge={'axis': {'range': [None, max_val]}, 'bar': {'color': "#10b981"}}
            ))
            charts["gauge"] = fig_to_dict(fig_gauge)

        # 8. Waterfall Chart (Mocking financial data flow)
        if len(numeric_cols) > 0:
            vals = df[numeric_cols[0]].head(5).tolist()
            if len(vals) > 1:
                vals[1] = -abs(vals[1])
            if len(vals) > 3:
                vals[3] = -abs(vals[3])
            
            measure = ["relative"] * len(vals) + ["total"]
            x_vals = [f"Point {i}" for i in range(len(vals))] + ["Total"]
            y_vals = vals + [sum(vals)]
            
            fig = go.Figure(go.Waterfall(
                name="20", orientation="v",
                measure=measure,
                x=x_vals,
                textposition="outside",
                text=[str(v) for v in y_vals],
                y=y_vals
            ))
            fig.update_layout(title="Waterfall Chart Analysis")
            charts["waterfall"] = fig_to_dict(fig)
            
        # 13. Box & Violin Plots (Statistical Distributions)
        if len(numeric_cols) > 0 and len(cat_cols) > 0:
            top_cats = df[cat_cols[0]].value_counts().head(5).index
            stat_df = df[df[cat_cols[0]].isin(top_cats)].head(500)
            fig_box = px.box(stat_df, x=cat_cols[0], y=numeric_cols[0], color=cat_cols[0], title=f"Box Plot: {numeric_cols[0]} Dist.")
            charts["box"] = fig_to_dict(fig_box)
            
            fig_violin = px.violin(stat_df, x=cat_cols[0], y=numeric_cols[0], color=cat_cols[0], box=True, title=f"Violin Plot: {numeric_cols[0]}")
            charts["violin"] = fig_to_dict(fig_violin)
            
        # 14. Funnel Chart (Mocking Pipeline stages)
        if len(numeric_cols) > 0:
            funnel_vals = sorted(df[numeric_cols[0]].head(5).dropna().abs().tolist(), reverse=True)
            stages = ["Leads", "Qualified", "Proposals", "Negotiation", "Closed"]
            if len(funnel_vals) == 5:
                fig_funnel = px.funnel(x=funnel_vals, y=stages, title="Sales Pipeline Funnel")
                charts["funnel"] = fig_to_dict(fig_funnel)
                
        # 15. Sunburst Chart (Hierarchical)
        if len(cat_cols) >= 2 and len(numeric_cols) > 0:
            # Dropna and filter positive values for Sunburst
            sun_df = df[[cat_cols[0], cat_cols[1], numeric_cols[0]]].dropna()
            sun_df = sun_df[sun_df[numeric_cols[0]] > 0].head(100)
            if not sun_df.empty:
                fig_sunburst = px.sunburst(sun_df, path=[cat_cols[0], cat_cols[1]], values=numeric_cols[0], title="Hierarchical Sunburst")
                charts["sunburst"] = fig_to_dict(fig_sunburst)
                
        # 16. 3D Scatter Plot
        if len(numeric_cols) >= 3:
            col1, col2, col3 = numeric_cols[0], numeric_cols[1], numeric_cols[2]
            scatter3d_df = df.head(150).fillna(0)
            color_arg = cat_cols[0] if len(cat_cols) > 0 else None
            fig_3d = px.scatter_3d(scatter3d_df, x=col1, y=col2, z=col3, color=color_arg, title="3D Multivariate Scatter")
            fig_3d.update_layout(margin=dict(l=0, r=0, b=0, t=30))
            charts["scatter3d"] = fig_to_dict(fig_3d)

        # 9. Geo Map Analysis (Auto-Detect Location columns)
        geo_keywords = ['country', 'iso', 'state', 'location', 'region', 'city', 'nation']
        geo_col = None
        for col in df.columns:
            if any(gk in col.lower() for gk in geo_keywords):
                geo_col = col
                break
                
        if geo_col and len(numeric_cols) > 0:
            # We assume it's a choropleth map. We'll use the first numeric column for color
            map_df = df.groupby(geo_col)[numeric_cols[0]].sum().reset_index()
            # A simple choropleth
            fig = px.choropleth(map_df, locations=geo_col, locationmode='country names', color=numeric_cols[0], title=f"Global {numeric_cols[0]} by {geo_col}")
            charts["map"] = fig_to_dict(fig)

        # 10. AI Smart Narrative (Deterministic Math-based Rules)
        narrative = f"This dataset contains {len(df):,} records and {len(df.columns)} dimensions. "
        
        if len(numeric_cols) > 0:
            primary_metric = numeric_cols[0]
            total_sum = df[primary_metric].sum()
            avg_val = df[primary_metric].mean()
            narrative += f"The total {primary_metric} across all records is {total_sum:,.2f}, with an average of {avg_val:,.2f}. "
            
        if len(cat_cols) > 0 and len(numeric_cols) > 0:
            primary_cat = cat_cols[0]
            top_performer = df.groupby(primary_cat)[numeric_cols[0]].sum().idxmax()
            top_val = df.groupby(primary_cat)[numeric_cols[0]].sum().max()
            narrative += f"The highest performing {primary_cat} is '{top_performer}' driving {top_val:,.2f} in {primary_metric}. "
            
            if df[primary_cat].nunique() > 1:
                lowest_performer = df.groupby(primary_cat)[numeric_cols[0]].sum().idxmin()
                narrative += f"Conversely, '{lowest_performer}' requires attention as the lowest contributor. "
                
        if len(numeric_cols) >= 2:
            corr_val = df[numeric_cols[0]].corr(df[numeric_cols[1]])
            if corr_val > 0.7:
                narrative += f"There is a strong positive correlation ({corr_val:.2f}) between {numeric_cols[0]} and {numeric_cols[1]}."
            elif corr_val < -0.7:
                narrative += f"There is a strong negative correlation ({corr_val:.2f}) between {numeric_cols[0]} and {numeric_cols[1]}."

        return {
            "success": True,
            "charts": charts,
            "narrative": narrative
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def iot_data_generator():
    """Simulates real-time IoT sensor data streaming."""
    counter = 0
    while True:
        data = {
            "time": time.strftime("%H:%M:%S"),
            "temperature": round(random.uniform(20.0, 85.0), 2),
            "pressure": round(random.uniform(1.0, 5.0), 2),
            "vibration": round(random.uniform(0.0, 10.0), 2)
        }
        yield f"data: {json.dumps(data)}\n\n"
        await asyncio.sleep(1)
        counter += 1

@app.get("/api/iot-stream")
async def stream_iot():
    return StreamingResponse(iot_data_generator(), media_type="text/event-stream")

class EmailRequest(BaseModel):
    email: str
    report_data: str # Can be base64 pdf or just narrative text
    filename: str = "DevForge_Analytics_Report.pdf"

@app.post("/api/email-report")
async def email_report(req: EmailRequest):
    """Automated Email Report Delivery Endpoint"""
    # Create a professional HTML email body
    html_body = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333;">
            <div style="background-color: #0f172a; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1 style="color: #34d399; margin: 0;">DevForge Analytics</h1>
            </div>
            <div style="padding: 20px; border: 1px solid #e2e8f0; border-radius: 0 0 10px 10px;">
                <h2>Your Automated Report is Ready</h2>
                <p>Hello,</p>
                <p>Please find attached the automated data analytics report you requested from the DevForge BI Platform.</p>
                <p><strong>Dataset Analysis Overview:</strong></p>
                <p style="background-color: #f8fafc; padding: 15px; border-left: 4px solid #3b82f6;">
                    {req.report_data[:500]}...
                </p>
                <br>
                <p>Best regards,<br>DevForge AI System</p>
            </div>
        </body>
    </html>
    """
    
    success = send_automated_report(
        to_email=req.email,
        subject="[DevForge BI] Your Automated Analytics Report",
        body=html_body
    )
    
    if success:
        return {"success": True, "message": "Email sent successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to send email. Check SMTP configuration.")


