#!/bin/bash
set -e

# Compile LaTeX document using a Docker LaTeX image
docker run --rm -v "$(pwd)":/workdir -w /workdir texlive/texlive pdflatex main.tex
