FROM ubuntu:latest

MAINTAINER Charan sairamcharanbethu18@gmail.com

RUN apt-get update -y && \
    apt-get install -y python-pip python-dev && \
    pip install --upgrade pip

COPY . /app

WORKDIR /app

RUN pip install -r requirements.txt

EXPOSE 8000

ENTRYPOINT [ "python" ]

CMD ["app.py"]