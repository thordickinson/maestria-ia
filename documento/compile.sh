#!/bin/bash
# set -e

IMG=danteev/texlive:latest

rm -f *.aux *.bbl *.bcf *.blg *.run.xml main.pdf

docker run --rm -v "$(pwd)":/workdir -w /workdir "$IMG" pdflatex -interaction=nonstopmode main.tex || true
docker run --rm -v "$(pwd)":/workdir -w /workdir "$IMG" bibtex main
docker run --rm -v "$(pwd)":/workdir -w /workdir "$IMG" pdflatex -interaction=nonstopmode main.tex
docker run --rm -v "$(pwd)":/workdir -w /workdir "$IMG" pdflatex -interaction=nonstopmode main.tex
