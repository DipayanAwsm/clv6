.PHONY: backend frontend train run-all docker-up docker-down

backend:
	cd backend && PYTHONPATH=. uvicorn main:app --host 0.0.0.0 --port 8000 --reload

frontend:
	cd frontend && npm install && npm run dev

train:
	cd backend && PYTHONPATH=. MPLCONFIGDIR=../.mplconfig python -m training.run_pipeline --input-csv ../data/raw/customer_clv_row_level.csv

run-all:
	@echo "Run backend and frontend in separate terminals: make backend / make frontend"

docker-up:
	docker compose up --build

docker-down:
	docker compose down
