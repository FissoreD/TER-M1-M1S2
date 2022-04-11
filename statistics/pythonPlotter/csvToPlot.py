import matplotlib.pyplot as plt
import pandas as pd
from os import listdir

folderPrefix = ["statistics/", "../"][0]
plotFolder = "plots/"


def savePlot(plot: plt, path: str):
    plot.savefig(folderPrefix + plotFolder + path,
                 bbox_inches='tight', facecolor="white")


def show(plt: plt):
    plt.show()


def csvToDf(csvPath):
    return pd.read_csv(csvPath, header=0)


def allCsvNameInDirectory():
    return [i for i in listdir(folderPrefix) if i.endswith(".csv")]


def plotCsv(df: pd.DataFrame, comparator: str, algos: str, fileName):
    fig, ax = plt.subplots()
    ax.set_title(f'Comparing {comparator}')
    for i in algos:
        print(f"{i} {comparator}")
        ax.plot(df[f"{i} {comparator}"], label=i)
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
        df = csvToDf(folderPrefix + fileName)
        partitions = {}
        for (pos, col) in enumerate(df.columns):
            if pos < 2:
                continue
            algo, comparator = col.split(" ", 1)
            if comparator not in partitions:
                partitions[comparator] = [algo]
            else:
                partitions[comparator].append(algo)
        print(partitions)
        for comparator, algos in partitions.items():
            fig = plotCsv(df, comparator, algos,
                          f"{fileName[:-4]}-{comparator}.png")
            # return fig


a = plotAllCsv()
