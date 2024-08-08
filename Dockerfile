# Use the official Alpine image as a parent image
FROM alpine:latest

# Set the working directory inside the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app

# Define a simple script to print "Hello, World!"
CMD ["echo", "Hello, World!"]
