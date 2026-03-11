import matplotlib.pyplot as plt
import matplotlib.patches as patches

def generate_vertical_flowchart():
    # Set up the figure size and axis
    fig, ax = plt.subplots(figsize=(10, 14))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 14)
    ax.axis('off')

    # Styling for the boxes
    standard_box = dict(boxstyle='round,pad=0.8', facecolor='#E3F2FD', edgecolor='#1565C0', lw=2)
    split_box = dict(boxstyle='round,pad=0.8', facecolor='#E8F5E9', edgecolor='#2E7D32', lw=2)
    final_box = dict(boxstyle='round,pad=1.0', facecolor='#FFF9C4', edgecolor='#FBC02D', lw=2)

    # Define Node positions (Label, Y-coordinate, X-coordinate, Style)
    nodes = [
        ("1. Data Acquisition\n(CSV Datasets)", 13, 5, standard_box),
        ("2. Data Preprocessing\n(Label Encoding & Scaling)", 11, 5, standard_box),
        ("3. Model Selection & Training\n(Architecture Setup)", 9, 5, standard_box),
        ("Classification Stream\n(Crop Recommendation)", 7, 3, split_box),
        ("Regression Stream\n(Yield Estimation)", 7, 7, split_box),
        ("4. Performance Evaluation\n(Accuracy, R2, MSE, Latency)", 4.5, 5, standard_box),
        ("5. Final System Output\n(Optimized Crop + Predicted Yield)", 2, 5, final_box)
    ]

    # Store coordinates for drawing arrows
    coords = {}
    for text, y, x, style in nodes:
        ax.text(x, y, text, ha='center', va='center', bbox=style, fontsize=11, fontweight='bold')
        coords[text] = (x, y)

    # Function to draw arrows between boxes
    def connect(start, end, shrinkA=30, shrinkB=30):
        ax.annotate('', xy=coords[end], xytext=coords[start],
                    arrowprops=dict(arrowstyle='->', lw=2, color='#424242', shrinkA=shrinkA, shrinkB=shrinkB))

    # Define the flow connections
    connect("1. Data Acquisition\n(CSV Datasets)", "2. Data Preprocessing\n(Label Encoding & Scaling)")
    connect("2. Data Preprocessing\n(Label Encoding & Scaling)", "3. Model Selection & Training\n(Architecture Setup)")
    
    # Branching to Dual Streams
    connect("3. Model Selection & Training\n(Architecture Setup)", "Classification Stream\n(Crop Recommendation)")
    connect("3. Model Selection & Training\n(Architecture Setup)", "Regression Stream\n(Yield Estimation)")
    
    # Merging back to Evaluation
    connect("Classification Stream\n(Crop Recommendation)", "4. Performance Evaluation\n(Accuracy, R2, MSE, Latency)")
    connect("Regression Stream\n(Yield Estimation)", "4. Performance Evaluation\n(Accuracy, R2, MSE, Latency)")
    
    # Final step
    connect("4. Performance Evaluation\n(Accuracy, R2, MSE, Latency)", "5. Final System Output\n(Optimized Crop + Predicted Yield)")

    plt.title("Crop Prediction & Yield Analysis Workflow", fontsize=16, fontweight='bold', pad=20)
    plt.tight_layout()
    plt.savefig('crop_project_flowchart.png', dpi=300, bbox_inches='tight')
    print("Flowchart saved as 'crop_project_flowchart.png'")

# Execute the function
generate_vertical_flowchart()