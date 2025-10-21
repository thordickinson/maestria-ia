# Build a dockerfile that takes the indexador-py and estimador-react and puts them in a docker container
# create a builder image from estimador-react
FROM node:20-alpine
WORKDIR /app
COPY estimador-react /app
RUN pnpm install
RUN pnpm run build

ENV POSTGIS_DB_HOST=localhost
ENV POSTGIS_DB_PORT=5432
ENV POSTGIS_DB_USER=postgres
ENV POSTGIS_DB_PASSWORD=postgres
ENV POSTGIS_DB_NAME=gisdb


FROM python:3.12-slim
WORKDIR /app
COPY indexador-py /app
RUN pip install --no-cache-dir -r requirements.txt
# copy from builder image
COPY --from=builder /app/dist /app/web

EXPOSE 8000
# use uvicorn to run the server
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]



