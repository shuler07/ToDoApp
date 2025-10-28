FROM python:3.13.7-alpine
RUN apk add --no-cache gcc musl-dev linux-headers
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["sh", "-c", "alembic upgrade head && uvicorn --host 0.0.0.0 --port 8000 main:app"]