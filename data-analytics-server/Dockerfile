FROM python:3

ADD main.py /

RUN pip install pandas
RUN pip install uvicorn
RUN pip install fastapi

CMD [ "python", "./main.py" ]
