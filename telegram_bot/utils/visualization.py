import matplotlib.pyplot as plt
import numpy as np

def draw_pie_chart(labels: list, values: list, colors: list, pie_path: str):
    fig, ax = plt.subplots()
    wedges, _ = ax.pie(values, colors=colors, startangle=90, radius=1)

    for i, wedge in enumerate(wedges):
        angle = (wedge.theta2 + wedge.theta1) / 2
        x = np.cos(np.deg2rad(angle))
        y = np.sin(np.deg2rad(angle))

        line_x = 1.05 * x
        line_y = 1.05 * y
        label_x = 1.25 * x
        label_y = 1.25 * y

        ax.plot([wedge.center[0] + line_x, wedge.center[0] + label_x],
                [wedge.center[1] + line_y, wedge.center[1] + label_y],
                color='black', lw=0.8)

        ax.text(wedge.center[0] + label_x, wedge.center[1] + label_y,
                f"{labels[i]} ({values[i]})",
                ha='center', va='center', fontsize=10)

    ax.axis('equal')
    plt.tight_layout()
    plt.savefig(pie_path)
    plt.close()