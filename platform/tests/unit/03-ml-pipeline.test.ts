/**
 * ============================================================
 * 🧠 ML Pipeline Mathematical & Logic Unit Tests
 * ML Pipeline Mathematical & Logic Unit Tests
 * ============================================================
 */

describe('🧠 ML Pipeline - Data Cleaning & Heuristics', () => {

  // ---- Outlier Detection (IQR) ----
  describe('📊 Outlier Detection (Interquartile Range)', () => {
    function detectOutliers(values: number[]): { outliers: number[], lowerBound: number, upperBound: number } {
      const sorted = [...values].sort((a, b) => a - b);
      const q1Idx = Math.floor(sorted.length * 0.25);
      const q3Idx = Math.floor(sorted.length * 0.75);
      
      const q1 = sorted[q1Idx];
      const q3 = sorted[q3Idx];
      const iqr = q3 - q1;
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;
      
      const outliers = values.filter(v => v < lowerBound || v > upperBound);
      return { outliers, lowerBound, upperBound };
    }

    test('सामान्य डेटा में कोई outliers नहीं होने चाहिए', () => {
      const data = [10, 12, 11, 13, 12, 10, 11, 12, 13, 11];
      const { outliers } = detectOutliers(data);
      expect(outliers).toEqual([]);
    });

    test('असामान्य मूल्य को outlier के रूप में पहचानना चाहिए', () => {
      const data = [10, 12, 11, 13, 12, 10, 11, 12, 13, 11, 100]; // 100 is outlier
      const { outliers } = detectOutliers(data);
      expect(outliers).toContain(100);
      expect(outliers.length).toBe(1);
    });
  });

  // ---- Imputation Logic ----
  describe('🧹 Imputation Logic (Mean/Median/Mode)', () => {
    function imputeNumeric(values: (number | null)[], strategy: 'mean' | 'median' = 'median'): number[] {
      const nonNulls = values.filter((v): v is number => v !== null);
      let fillValue = 0;
      
      if (strategy === 'mean') {
        fillValue = nonNulls.reduce((a, b) => a + b, 0) / nonNulls.length;
      } else {
        const sorted = [...nonNulls].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        fillValue = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
      }
      
      return values.map(v => v === null ? fillValue : v);
    }

    test('Null values को median से रिप्लेस करना चाहिए', () => {
      const data = [1, 2, null, 4, 5]; // Median of [1,2,4,5] is 3
      const result = imputeNumeric(data, 'median');
      expect(result[2]).toBe(3);
    });

    test('Null values को mean से रिप्लेस करना चाहिए', () => {
      const data = [1, 2, null, 4, 5]; // Mean of [1,2,4,5] is 3
      const result = imputeNumeric(data, 'mean');
      expect(result[2]).toBe(3);
    });
  });

  // ---- ML Model Selection Heuristics ----
  describe('🤖 ML Model Selection Heuristic', () => {
    function determineMlMode(uniqueTargetCount: number, isTargetNumeric: boolean): 'classification' | 'regression' | 'clustering' {
      if (uniqueTargetCount <= 10) {
        return 'classification';
      }
      if (isTargetNumeric) {
        return 'regression';
      }
      return 'classification';
    }

    test('10 या उससे कम unique values होने पर classification चुनना चाहिए', () => {
      expect(determineMlMode(2, true)).toBe('classification'); // binary class
      expect(determineMlMode(5, false)).toBe('classification'); // multiclass string
      expect(determineMlMode(10, true)).toBe('classification'); 
    });

    test('10 से ज़्यादा unique values और numeric होने पर regression चुनना चाहिए', () => {
      expect(determineMlMode(100, true)).toBe('regression'); // continuous numeric target
      expect(determineMlMode(15, true)).toBe('regression');
    });
  });

  // ---- Z-Score Anomaly Detection ----
  describe('⚠️ Z-Score Anomaly Detection', () => {
    interface AnomalyResult {
      index: number;
      value: number;
      zScore: number;
    }

    function scanForAnomalies(values: number[], threshold: number = 3): AnomalyResult[] {
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const std = Math.sqrt(variance);
      
      if (std === 0) return [];
      
      const anomalies: AnomalyResult[] = [];
      values.forEach((val, index) => {
        const zScore = (val - mean) / std;
        if (Math.abs(zScore) > threshold) {
          anomalies.push({ index, value: val, zScore });
        }
      });
      
      return anomalies;
    }

    test('3 standard deviations से बाहर के मूल्यों को पहचानना चाहिए', () => {
      const data = Array.from({ length: 50 }, () => 10);
      data[25] = 100; // Extreme spike
      
      const anomalies = scanForAnomalies(data, 3);
      expect(anomalies.length).toBe(1);
      expect(anomalies[0].index).toBe(25);
      expect(anomalies[0].value).toBe(100);
      expect(Math.abs(anomalies[0].zScore)).toBeGreaterThan(3);
    });

    test('समान मूल्यों में कोई विसंगति नहीं होनी चाहिए', () => {
      const data = [10, 10, 10, 10, 10];
      const anomalies = scanForAnomalies(data, 3);
      expect(anomalies).toEqual([]);
    });
  });
});
