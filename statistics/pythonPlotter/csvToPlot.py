from scipy.optimize import curve_fit
import matplotlib.pyplot as plt
import pandas as pd
from os import listdir
import os
import numpy as np

folderPrefix = ["statistics/", "../"][0]
plotFolder = "plots/"
trendGraphic = False


def objective(x, a, b, c, d, f):
    return (a * x) + (b * x**2) + (c * x**3) + (d * x**4) + f


def amortizeCurve(x, y):
    if trendGraphic:
        popt, _ = curve_fit(objective, x, y)
        a, b, c, d, f = popt
        x_line = np.arange(min(x), max(x), 1)
        y_line = objective(x_line, a, b, c, d, f)
        return x_line, y_line
    return x, y


def savePlot(plot: plt, path: str):
    plot.savefig(path, bbox_inches='tight', facecolor="white")


def show(plt: plt):
    plt.show()


def csvToDf(csvPath):
    return pd.read_csv(csvPath, header=0)


def allCsvNameInDirectory():
    return [i for i in listdir(folderPrefix) if i.endswith(".csv")]


def plotCsv(df: pd.DataFrame, comparator: str, algos: str, fileName: str):
    fig, ax = plt.subplots()
    ax.set_title(f'Comparing {comparator}')
    colors = ['m', 'g']
    for i, j in zip(algos, colors):
        x, y = df['Description'], df[f"{i} {comparator}"]
        x_line, y_line = amortizeCurve(x, y)
        print(f"{i} {comparator} {fileName}")
        ax.plot(x_line, y_line, linestyle='--', color=j, label=i)
    leg = ax.legend()
    ax.set_xlabel(
        "n" if 'benchMark' not in fileName else 'State number in minimum DFA')
    ax.set_ylabel(comparator)
    savePlot(fig, fileName)
    # show(fig)
    return fig


def plotAllCsv():
    allCsv = allCsvNameInDirectory()
    print("These are allCSV", allCsv)
    for fileName in allCsv:
        print(fileName)
        folderPath = folderPrefix + plotFolder + fileName[:-4] + "/"
        if not os.path.exists(folderPath):
            os.mkdir(folderPath)
        df = csvToDf(folderPrefix + fileName)
        df = df.groupby('L State nb in A')
        df = df.mean()
        df = df.reset_index()
        infos = {"algo": set(), "comp": set()}
        for (pos, col) in enumerate(df.columns):
            if pos < 3:
                continue
            algo, comparator = col.split(" ", 1)
            infos["algo"].add(algo)
            infos["comp"].add(comparator)
        print(infos)
        for comparator in infos["comp"]:
            fig = plotCsv(df, comparator, infos["algo"],
                          f"{folderPath}{comparator}.png")
            # return fig


a = plotAllCsv()
