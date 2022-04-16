import matplotlib.pyplot as plt
import pandas as pd
from os import listdir
import os
import numpy as np

folderPrefix = ["statistics/", "../"][0]
plotFolder = "plots/"


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
    for i in algos:
        print(f"{i} {comparator}")
        ax.plot(df['Description'],
                df[f"{i} {comparator}"], label=i)
    leg = ax.legend()
    ax.set_xlabel("Regex")
    ax.set_ylabel(comparator)
    savePlot(fig, fileName)
    # show(fig)
    return fig


def plotAllCsv():
    allCsv = allCsvNameInDirectory()
    print("This are allCSV", allCsv)
    for fileName in allCsv:
        folderPath = folderPrefix + plotFolder + fileName[:-4] + "/"
        if not os.path.exists(folderPath):
            os.mkdir(folderPath)
        df = csvToDf(folderPrefix + fileName)
        infos = {"algo": set(), "comp": set()}
        for (pos, col) in enumerate(df.columns):
            if pos < 3:
                continue
            algo, comparator = col.split(" ", 1)
            infos["algo"].add(algo)
            infos["comp"].add(comparator)
        for comparator in infos["comp"]:
            fig = plotCsv(df, comparator, infos["algo"],
                          f"{folderPath}/{comparator}.png")
            # return fig


a = plotAllCsv()
