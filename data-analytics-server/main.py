import uvicorn
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware
import pandas as pd

class DataList(BaseModel):
    data: list[dict]


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analysis")
async def root(item: DataList):
    df = pd.DataFrame.from_records(item.data, index=[str(i + 1) for i in range(len(item.data))])
    corr = df.corr()
    corr_notna = ~corr.isna().all()
    corr = corr.loc[corr_notna, corr_notna]
    return corr

@app.get("/health")
async def health_check():
    return JSONResponse(content={"status": "ok"})

if __name__ == "__main__":
    uvicorn.run(app, port=8081)
