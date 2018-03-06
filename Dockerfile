# Use an official Python runtime as a parent image
FROM python:3.6-alpine3.7

# Set the working directory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
ADD ./app /app

# Install any needed packages specified in requirements.txt
RUN pip install --trusted-host pypi.python.org -r requirements.txt

RUN apk add --no-cache sqlite

# Make port 5000 available to the world outside this container
EXPOSE 5000

# Run app.py when the container launches
CMD ["python", "application.py"]