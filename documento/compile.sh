#!/bin/bash
set -e

# Compile LaTeX document (BibLaTeX + Biber) using a Docker TeX Live image
IMG=texlive/texlive

# First LaTeX pass
docker run --rm -v "$(pwd)":/workdir -w /workdir "$IMG" pdflatex -interaction=nonstopmode -halt-on-error main.tex

# Biber pass (bibliography)
docker run --rm -v "$(pwd)":/workdir -w /workdir "$IMG" biber main

# Second and third LaTeX passes to resolve references
docker run --rm -v "$(pwd)":/workdir -w /workdir "$IMG" pdflatex -interaction=nonstopmode -halt-on-error main.tex
docker run --rm -v "$(pwd)":/workdir -w /workdir "$IMG" pdflatex -interaction=nonstopmode -halt-on-error main.tex
