import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor
from sklearn.svm import SVC, SVR
from sklearn.linear_model import LogisticRegression, LinearRegression
from sklearn.metrics import accuracy_score, top_k_accuracy_score, mean_squared_error, r2_score

# ==========================================
# 1. LOAD DATA
# ==========================================
try:
    df_class = pd.read_csv('WB_Dataset1_without_lon-lat.csv')
    df_reg = pd.read_csv('WB_Dataset2_without_lon-lat.csv')
except FileNotFoundError:
    print("Error: Files not found.")
    exit()

# ==========================================
# 2. CLASSIFICATION PREPROCESSING
# ==========================================
X_c = df_class[['state', 'soil_type', 'rainfall_mm', 'season']]
y_c_raw = df_class['crop_name']

X_c = pd.get_dummies(X_c, columns=['state', 'soil_type', 'season'], drop_first=True)
le_c = LabelEncoder()
y_c = le_c.fit_transform(y_c_raw)

X_train_c, X_test_c, y_train_c, y_test_c = train_test_split(X_c, y_c, test_size=0.2, random_state=42)

scaler_c = StandardScaler()
X_train_c = scaler_c.fit_transform(X_train_c)
X_test_c = scaler_c.transform(X_test_c)

# ==========================================
# 3. REGRESSION PREPROCESSING
# ==========================================
X_r = df_reg[['state', 'soil_type', 'rainfall_mm', 'season', 'crop_name', 'area_ha']]
y_r = df_reg['predicted_yield_kg_per_ha'].values.reshape(-1, 1)

X_r = pd.get_dummies(X_r, columns=['state', 'soil_type', 'season', 'crop_name'], drop_first=True)
X_train_r, X_test_r, y_train_r, y_test_r = train_test_split(X_r, y_r, test_size=0.2, random_state=42)

scaler_x_r, scaler_y_r = StandardScaler(), StandardScaler()
X_train_r = scaler_x_r.fit_transform(X_train_r)
X_test_r = scaler_x_r.transform(X_test_r)
y_train_r_scaled = scaler_y_r.fit_transform(y_train_r).ravel()

# ==========================================
# 4. TRAIN & EVALUATE MODELS
# ==========================================

# --- A. Classification (Standard vs Top-3 Accuracy) ---
models_cls = {
    "Gradient Boosting": GradientBoostingClassifier(random_state=42),
    "SVM": SVC(kernel='rbf', probability=True, random_state=42),
    "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42)
}

results_top1 = []
results_top3 = []
model_names = list(models_cls.keys())

print("--- Classification Accuracy Comparison ---")
for name, model in models_cls.items():
    model.fit(X_train_c, y_train_c)
    
    # Probabilities for Top-K calculation
    y_probs = model.predict_proba(X_test_c)
    
    # Calculate Metrics
    t1_acc = accuracy_score(y_test_c, model.predict(X_test_c))
    t3_acc = top_k_accuracy_score(y_test_c, y_probs, k=3)
    
    results_top1.append(t1_acc)
    results_top3.append(t3_acc)
    print(f"{name}: Top-1 Accuracy = {t1_acc:.2%}, Top-3 Accuracy = {t3_acc:.2%}")

# --- B. Regression Results ---
models_reg = {
    "Gradient Boosting": GradientBoostingRegressor(random_state=42),
    "SVR (SVM)": SVR(kernel='rbf', C=10),
    "Linear Regression": LinearRegression()
}

results_reg_r2 = {}
for name, model in models_reg.items():
    model.fit(X_train_r, y_train_r_scaled)
    y_pred_scaled = model.predict(X_test_r)
    y_pred = scaler_y_r.inverse_transform(y_pred_scaled.reshape(-1, 1))
    results_reg_r2[name] = r2_score(y_test_r, y_pred)

# ==========================================
# 5. VISUALIZATION
# ==========================================
fig, ax = plt.subplots(1, 2, figsize=(16, 6))

# Classification Chart (Grouped Bar Chart for Top-1 vs Top-3)
x_indexes = np.arange(len(model_names))
width = 0.35

ax[0].bar(x_indexes - width/2, results_top1, width, label='Top-1 (Standard)', color='#3498db')
ax[0].bar(x_indexes + width/2, results_top3, width, label='Top-3 (Any of 3)', color='#2ecc71')

ax[0].set_title("Classification: Top-1 vs Top-3 Accuracy")
ax[0].set_xticks(x_indexes)
ax[0].set_xticklabels(model_names)
ax[0].set_ylabel("Accuracy Score")
ax[0].set_ylim(0, 1.1)
ax[0].legend()

# Regression R2 Chart
sns.barplot(x=list(results_reg_r2.keys()), y=list(results_reg_r2.values()), ax=ax[1], palette="magma")
ax[1].set_title("Regression: Yield Prediction R2 Score")
ax[1].set_ylim(min(0, min(results_reg_r2.values())), 1.1)
ax[1].axhline(0, color='black', lw=1)

plt.tight_layout()
plt.show()