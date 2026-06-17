import sys
import os
import json
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler, LabelEncoder

def clean_and_prepare_data(df):
    """
    Auto-detects missing values, outliers, and parses datetimes.
    Cleans data in-place and returns statistical summaries.
    """
    cleaning_log = {
        "imputed_count": 0,
        "outliers_detected": 0,
        "features_added": []
    }
    
    # Pre-processing: Scan string/object columns for currency, percentage, and formatted numbers
    for col in df.columns:
        if df[col].dtype == 'object':
            non_null_series = df[col].dropna()
            if non_null_series.empty:
                continue
            
            def try_cast_numeric(val):
                if pd.isna(val):
                    return None
                val_str = str(val).strip()
                if val_str == '' or val_str.lower() in ['nan', 'null', 'none', '-']:
                    return None
                # Clean currency, percentages, commas, spaces
                # Allow only digits, decimal point, and negative sign
                cleaned = "".join([c for c in val_str if c.isdigit() or c in ['.', '-']])
                try:
                    return float(cleaned)
                except ValueError:
                    return None

            converted_values = non_null_series.apply(try_cast_numeric)
            valid_conversions = converted_values.dropna()
            
            if len(non_null_series) > 0 and len(valid_conversions) / len(non_null_series) >= 0.8:
                df[col] = df[col].apply(try_cast_numeric)
                df[col] = pd.to_numeric(df[col], errors='coerce')
                cleaning_log["features_added"].append(f"{col}_cast_float")
    
    # 1. Handle missing values
    for col in df.columns:
        null_count = df[col].isnull().sum()
        if null_count > 0:
            cleaning_log["imputed_count"] += int(null_count)
            if pd.api.types.is_numeric_dtype(df[col]):
                median_val = df[col].median()
                df[col] = df[col].fillna(median_val)
            else:
                mode_series = df[col].mode()
                mode_val = mode_series[0] if not mode_series.empty else "Unknown"
                df[col] = df[col].fillna(mode_val)
                
    # 2. Detect & clean outliers for numeric columns
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    for col in numeric_cols:
        # Avoid columns that look like IDs or codes
        if df[col].nunique() <= 10 or col.lower() in ['id', 'zip', 'code', 'year']:
            continue
        q1 = df[col].quantile(0.25)
        q3 = df[col].quantile(0.75)
        iqr = q3 - q1
        lower_bound = q1 - 1.5 * iqr
        upper_bound = q3 + 1.5 * iqr
        
        outliers_mask = (df[col] < lower_bound) | (df[col] > upper_bound)
        outliers_count = outliers_mask.sum()
        
        if outliers_count > 0:
            cleaning_log["outliers_detected"] += int(outliers_count)
            # Impute outliers with median
            median_val = df[col].median()
            df.loc[outliers_mask, col] = median_val
            
    # 3. Handle Datetimes & Feature Engineering
    datetime_cols = []
    for col in df.columns:
        if df[col].dtype == 'object':
            # Try to convert to datetime if it looks like a date
            if any(term in col.lower() for term in ['date', 'time', 'timestamp', 'created', 'updated']):
                try:
                    df[col] = pd.to_datetime(df[col])
                    datetime_cols.append(col)
                except Exception:
                    pass
        elif pd.api.types.is_datetime64_any_dtype(df[col]):
            datetime_cols.append(col)
            
    for col in datetime_cols:
        df[f"{col}_year"] = df[col].dt.year
        df[f"{col}_month"] = df[col].dt.month
        df[f"{col}_day"] = df[col].dt.day
        df[f"{col}_dayofweek"] = df[col].dt.dayofweek
        cleaning_log["features_added"].extend([
            f"{col}_year", f"{col}_month", f"{col}_day", f"{col}_dayofweek"
        ])
        
    return df, cleaning_log

def detect_anomalies(df):
    """
    Identifies rows where any numeric feature deviates heavily (Z-score > 3).
    """
    anomalies = []
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    
    # Exclude engineered datetime parts and short unique columns
    clean_numeric_cols = [c for c in numeric_cols if df[c].nunique() > 10 and not any(term in c for term in ['_year', '_month', '_day'])]
    
    if not clean_numeric_cols:
        return anomalies
        
    for col in clean_numeric_cols:
        col_mean = df[col].mean()
        col_std = df[col].std()
        if col_std == 0:
            continue
            
        z_scores = (df[col] - col_mean) / col_std
        anom_mask = z_scores.abs() > 3
        anom_indices = df[anom_mask].index
        
        for idx in anom_indices[:50]:  # Limit anomaly logging to avoid huge JSONs
            val = df.loc[idx, col]
            z_val = z_scores.loc[idx]
            anomalies.append({
                "row_index": int(idx),
                "column": col,
                "value": float(val) if isinstance(val, (np.integer, np.floating)) else val,
                "score": float(abs(z_val)),
                "severity": "critical" if abs(z_val) > 4.5 else "warning",
                "type": f"Statistical Outlier (Z-score: {z_val:.2f})"
            })
            
    return anomalies

def run_ml_pipeline(df, target_col=None):
    """
    Analyzes the dataset, runs regression, classification, or clustering,
    and constructs Plotly chart configuration structures.
    """
    result = {}
    
    # Profile the data
    columns_profile = []
    for col in df.columns:
        nulls = int(df[col].isnull().sum())
        dtype = str(df[col].dtype)
        unique_count = int(df[col].nunique())
        columns_profile.append({
            "name": col,
            "type": dtype,
            "nulls": nulls,
            "unique": unique_count
        })
    result["data_profile"] = columns_profile

    # Drop non-predictive columns like IDs
    cols_to_drop = [c for c in df.columns if c.lower() in ['id', 'uuid', 'index', 'key'] or pd.api.types.is_datetime64_any_dtype(df[c])]
    df_ml = df.drop(columns=cols_to_drop)
    
    # Process categorical variables for ML
    label_encoders = {}
    for col in df_ml.columns:
        if df_ml[col].dtype == 'object' or isinstance(df_ml[col].dtype, pd.CategoricalDtype):
            le = LabelEncoder()
            df_ml[col] = le.fit_transform(df_ml[col].astype(str))
            label_encoders[col] = le
            
    # Auto-detect target column if not provided
    if not target_col or target_col not in df.columns:
        possible_targets = ['churn', 'churn_risk', 'revenue', 'target', 'label', 'class', 'conversion', 'price']
        found_targets = [c for c in possible_targets if c in df_ml.columns]
        if found_targets:
            target_col = found_targets[0]
        else:
            # Fallback to the last column in df_ml
            if len(df_ml.columns) > 1:
                target_col = df_ml.columns[-1]
            else:
                target_col = None

    # Determine ML Mode
    numeric_cols = df_ml.select_dtypes(include=[np.number]).columns
    if target_col and target_col in df_ml.columns:
        target_unique = df_ml[target_col].nunique()
        is_categorical_target = df[target_col].dtype == 'object' or df[target_col].dtype == 'bool' or target_unique <= 10
        
        X = df_ml.drop(columns=[target_col])
        y = df_ml[target_col]
        
        # If X is empty (e.g. 1 column dataset), fallback to clustering
        if X.empty:
            ml_mode = "clustering"
        elif is_categorical_target:
            ml_mode = "classification"
        else:
            ml_mode = "regression"
    else:
        ml_mode = "clustering"
        
    # Run algorithms based on mode
    if ml_mode == "classification":
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        model = RandomForestClassifier(n_estimators=50, random_state=42)
        model.fit(X_train, y_train)
        
        # Evaluate
        accuracy = float(model.score(X_test, y_test))
        importances = model.feature_importances_
        feature_imp_dict = {col: float(imp) for col, imp in zip(X.columns, importances)}
        
        # Sort importances
        sorted_imp = sorted(feature_imp_dict.items(), key=lambda x: x[1], reverse=True)
        
        result["model_info"] = {
            "type": "classification",
            "target_column": target_col,
            "algorithm": "Random Forest Classifier",
            "metrics": {
                "accuracy": accuracy
            },
            "feature_importances": dict(sorted_imp[:10])
        }
        
        # Plotly chart: Feature Importances
        result["visualization"] = {
            "data": [
                {
                    "x": [item[0] for item in sorted_imp[:10]],
                    "y": [item[1] for item in sorted_imp[:10]],
                    "type": "bar",
                    "marker": { "color": "#8B5CF6" }, # Sleek purple
                    "name": "Feature Importance"
                }
            ],
            "layout": {
                "title": f"Feature Importances for Predicting {target_col}",
                "xaxis": { "title": "Features" },
                "yaxis": { "title": "Importance Score" },
                "paper_bgcolor": "rgba(0,0,0,0)",
                "plot_bgcolor": "rgba(0,0,0,0)",
                "font": { "color": "#F3F4F6" }
            }
        }
        
    elif ml_mode == "regression":
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        model = RandomForestRegressor(n_estimators=50, random_state=42)
        model.fit(X_train, y_train)
        
        # Evaluate
        r2 = float(model.score(X_test, y_test))
        preds = model.predict(X_test)
        mae = float(np.mean(np.abs(preds - y_test)))
        
        importances = model.feature_importances_
        feature_imp_dict = {col: float(imp) for col, imp in zip(X.columns, importances)}
        sorted_imp = sorted(feature_imp_dict.items(), key=lambda x: x[1], reverse=True)
        
        result["model_info"] = {
            "type": "regression",
            "target_column": target_col,
            "algorithm": "Random Forest Regressor",
            "metrics": {
                "r2_score": r2,
                "mean_absolute_error": mae
            },
            "feature_importances": dict(sorted_imp[:10])
        }
        
        # Sorting for plotting (just pick first 50 test samples for clarity)
        plot_len = min(50, len(y_test))
        y_test_plot = y_test.iloc[:plot_len].tolist()
        preds_plot = preds[:plot_len].tolist()
        
        # Plotly chart: Actual vs Predicted
        result["visualization"] = {
            "data": [
                {
                    "x": list(range(plot_len)),
                    "y": y_test_plot,
                    "type": "scatter",
                    "mode": "lines+markers",
                    "name": "Actual",
                    "line": { "color": "#10B981" } # Green
                },
                {
                    "x": list(range(plot_len)),
                    "y": preds_plot,
                    "type": "scatter",
                    "mode": "lines+markers",
                    "name": "Predicted",
                    "line": { "color": "#3B82F6", "dash": "dash" } # Blue dashed
                }
            ],
            "layout": {
                "title": f"Actual vs Predicted {target_col} (Test Samples)",
                "xaxis": { "title": "Sample Index" },
                "yaxis": { "title": target_col },
                "paper_bgcolor": "rgba(0,0,0,0)",
                "plot_bgcolor": "rgba(0,0,0,0)",
                "font": { "color": "#F3F4F6" }
            }
        }
        
    else:  # Clustering
        # We need at least 2 numerical columns for clustering & PCA
        numeric_data = df_ml.select_dtypes(include=[np.number])
        if numeric_data.shape[1] < 2:
            # If not enough numeric columns, create dummy ones or scale whatever is there
            for i in range(2 - numeric_data.shape[1]):
                df_ml[f"dummy_{i}"] = np.random.randn(len(df_ml))
            numeric_data = df_ml.select_dtypes(include=[np.number])
            
        scaler = StandardScaler()
        scaled_data = scaler.fit_transform(numeric_data)
        
        n_clusters = min(3, len(df_ml))
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        clusters = kmeans.fit_predict(scaled_data)
        
        # Calculate cluster sizes
        sizes = [int(np.sum(clusters == i)) for i in range(n_clusters)]
        
        # Dimensionality reduction for visualization
        pca = PCA(n_components=2)
        components = pca.fit_transform(scaled_data)
        
        result["model_info"] = {
            "type": "clustering",
            "target_column": "None (Unsupervised)",
            "algorithm": "K-Means Clustering",
            "metrics": {
                "inertia": float(kmeans.inertia_),
                "clusters": n_clusters,
                "cluster_distribution": sizes
            },
            "feature_importances": {}
        }
        
        # Plotly chart: 2D Scatter of clusters
        scatter_data = []
        for i in range(n_clusters):
            mask = clusters == i
            scatter_data.append({
                "x": components[mask, 0].tolist(),
                "y": components[mask, 1].tolist(),
                "type": "scatter",
                "mode": "markers",
                "name": f"Cluster {i} ({sizes[i]} records)",
                "marker": { "size": 8 }
            })
            
        result["visualization"] = {
            "data": scatter_data,
            "layout": {
                "title": "Customer/Data Segmentation (PCA 2D Projection)",
                "xaxis": { "title": "Principal Component 1" },
                "yaxis": { "title": "Principal Component 2" },
                "paper_bgcolor": "rgba(0,0,0,0)",
                "plot_bgcolor": "rgba(0,0,0,0)",
                "font": { "color": "#F3F4F6" }
            }
        }
        
    return result

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "Missing input file path argument"}))
        sys.exit(1)
        
    file_path = sys.argv[1]
    target_col = sys.argv[2] if len(sys.argv) > 2 else None
    
    if not os.path.exists(file_path):
        print(json.dumps({"success": False, "error": f"File not found: {file_path}"}))
        sys.exit(1)
        
    try:
        _, ext = os.path.splitext(file_path)
        if ext.lower() == '.json':
            df = pd.read_json(file_path)
        else:
            df = pd.read_csv(file_path)
            
        if df.empty:
            print(json.dumps({"success": False, "error": "Empty dataset provided"}))
            sys.exit(1)
            
        # Clean and prepare
        df_clean, cleaning_log = clean_and_prepare_data(df)
        
        # Run anomaly detection
        anomalies = detect_anomalies(df_clean)
        
        # Run ML models and create visualizations
        pipeline_output = run_ml_pipeline(df_clean, target_col)
        
        # Consolidate results
        final_output = {
            "success": True,
            "summary": {
                "row_count": len(df),
                "column_count": len(df.columns),
                "columns": list(df.columns)
            },
            "cleaning": cleaning_log,
            "anomalies": anomalies,
            "model_info": pipeline_output.get("model_info"),
            "data_profile": pipeline_output.get("data_profile"),
            "visualization": pipeline_output.get("visualization")
        }
        
        print(json.dumps(final_output))
        
    except Exception as e:
        import traceback
        err_msg = {
            "success": False,
            "error": str(e),
            "traceback": traceback.format_exc()
        }
        print(json.dumps(err_msg))
        sys.exit(1)

if __name__ == "__main__":
    main()
