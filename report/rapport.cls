%%
%% This is file `rapport.cls',
%% generated with the docstrip utility.
%%
%% The original source files were:
%%
%% rapport.dtx  (with options: `class')
%% -------:| ---------------------------------------------------------------------
%% rapport:| This package extends the article document class for students reports.
%%  Author:| Marie Pelleau
%%  E-mail:| marie.pelleau@univ-cotedazur.fr
%% License:| Released under the LaTeX Project Public License v1.3c or later
%%     See:| http://www.latex-project.org/lppl.txt
%% 
\NeedsTeXFormat{LaTeX2e}[1999/12/01]
\ProvidesClass{rapport}
    [2021/11/22 v1.10 adding the titlepageneglish macro.]
\LoadClass[a4paper, twoside]{article}

\DeclareOption*{\PassOptionsToClass{\CurrentOption}{article}}
\ProcessOptions\relax


\RequirePackage{geometry,tikz,afterpage}
\RequirePackage{titling,fancyhdr}
\RequirePackage{graphicx}
\RequirePackage{enumitem}
\RequirePackage{amsthm}
\RequirePackage{amssymb}
\RequirePackage{xspace}

\usepackage[utf8]{inputenc}

\usepackage{pifont}
\usepackage{url} 
\usepackage{xstring}
\usepackage{etoolbox}
% \usepackage{syntax}
\usepackage{bm}


\usetikzlibrary{positioning} 

\usepackage[colorlinks, citecolor=red!60!green, linkcolor=blue!60!green, urlcolor=magenta]{hyperref}

% \usepackage{algorithm}
\usepackage{variable}
\usepackage{float}
% \usepackage{algo}
\usepackage{colorationSyntaxique}
\usepackage{mathtools}
\usepackage{tikz}
\usepackage{subcaption}
\usepackage[capitalise,noabbrev,nameinlink]{cleveref}
\usetikzlibrary{automata, positioning, arrows}


\usepackage[linesnumbered,ruled]{algorithm2e}
\usepackage[outputdir=.aux]{minted}

\crefname{algocf}{Algorithm}{Algorithms}

% Bibliography
\usepackage[
backend=biber,
sorting=ynt
]{biblatex}
\addbibresource{sections/References.bib}

\pagestyle{fancy}
\renewcommand{\sectionmark}[1]{\markboth{\thesection.\ #1}{}}
\fancyfoot{}

\fancyhead[LE]{\textsl{\leftmark}}
\fancyhead[RE, LO]{\textbf{\thepage}}
\fancyhead[RO]{\textsl{\rightmark}}

\def\etc{\textit{etc.}}


\theoremstyle{definition}
\newtheorem{example}{Example}
\newtheorem{theorem}{Theorem}
\newtheorem{definition}{Definition}[section]
\newtheorem{notation}{Notation}
\newtheorem{lemma}{Lemma}

\theoremstyle{remark}
\newtheorem*{remark}{Remark}

\graphicspath{img/}

\makeatletter         
\renewcommand\maketitle{
\newgeometry{top=0.8in,bottom=1in,right=1in,left=1in}


\author{Fissore Davide}
\title{Comparison of L* and NL* algorithm}

\makeatletter
\let\thetitle\@title
\let\theauthor\@author
\makeatother

\newcommand{\professor}{Cinzia Di Giusto \\ Etienne Lozes}
\newcommand{\course}{Master in Computer Science}
\newcommand{\subcourse}{Course : TER}

\newcommand{\HRule}{\rule{\linewidth}{0.5mm}} % Defines a new command for the horizontal lines, change thickness here

\begin{center} % Center everything on the page
 
%--------------------
%	LOGO SECTION
%--------------------

\includegraphics[width=13cm]{logo_haut_uca.png}\\[3cm] % Include a department/university logo - this will require the graphicx package
 
 
%--------------------
%	HEADING SECTIONS
%--------------------

% \textsc{\LARGE University Name}\\[1.5cm] % Name of your university/college
\ifdefempty{\subcourse}{}{\textsc{\Large \course}\\[0.5cm]} % Major heading such as course name
\ifdefempty{\subcourse}{}{\textsc{\large \subcourse}\\[0.5cm]} % Minor heading such as course title

%--------------------
%	TITLE SECTION
%--------------------

\HRule \\[0.8cm]
{\huge \bfseries \thetitle}\\[0.4cm] % Title of your document
\HRule \\[1.5cm]
 
%--------------------
%	AUTHOR SECTION
%--------------------

\begin{minipage}{0.4\textwidth}
\begin{flushleft} \large
\emph{Author:}\\
\StrSubstitute{\theauthor}{,}{\newline}% Your name
\end{flushleft}
\end{minipage}
~
\ifdefempty{\professor}{}{
    \begin{minipage}{0.4\textwidth}
    \begin{flushright} \large
    \emph{Supervisor:} \\
    \StrSubstitute{\professor}{,}{\newline}% Supervisor
    \end{flushright}
    \end{minipage}
}


\begin{abstract}
    Angluin's L* algorithm \cite{LPaper} is a famous algorithm for learning deterministic finite state automata from membership and equivalence queries.
    Bollig et al NL* \cite{NLPaper} algorithm is a variant of this algorithm, where the automaton that is learned may be non deterministic, and therefore exponentially more succinct.
    The goal of this TERD is to understand the theory behind these two algorithms, and if the time permits, to implement them and compare them.
\end{abstract}

% If you don't want a supervisor, uncomment the two lines below and remove the section above
%\Large \emph{Author:}\\
%John \textsc{Smith}\\[3cm] % Your name

%--------------------
%	DATE SECTION
%--------------------
\mbox{}
\vfill
{\large Spring 2021-2022}

%--------------------
\end{center}
}
\makeatother