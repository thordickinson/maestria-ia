FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY estimador-react /app
RUN pnpm install
RUN pnpm run build

ENV POSTGIS_DB_HOST=localhost
ENV POSTGIS_DB_PORT=5432
ENV POSTGIS_DB_USER=postgres
ENV POSTGIS_DB_PASSWORD=postgres
ENV POSTGIS_DB_NAME=gisdb

ARG model=xgboost_model_2.1.pkl


FROM python:3.12-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*
COPY indexador-py /app
RUN pip install --no-cache-dir -r requirements.txt
COPY --from=builder /app/dist /app/web
COPY ./analisis/data/models/${model} models/prediction_model.pkl

EXPOSE 8000
# use uvicorn to run the server
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]



