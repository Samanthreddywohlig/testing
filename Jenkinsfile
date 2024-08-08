node {
    def DOCKER_USER = 'samanthwohlig'  // Docker Hub username
    def DOCKER_PASS = 'wohlig@123'     // Docker Hub password
    def REPO_NAME = 'production-testing'
    def IMAGE_NAME = 'hello-world'
    def DOCKERFILE_PATH = 'path/to/Dockerfile'  // Relative path to Dockerfile

    stage('Checkout') {
        checkout scm
    }

    
    stage('Create Docker Repository') {
        def responseCode = sh(script: """
            curl -X POST \
              -H "Content-Type: application/json" \
              -u $DOCKER_USER:$DOCKER_PASS \
              -d '{"name":"${REPO_NAME}","description":"Repository for production testing","is_private":false}' \
              https://hub.docker.com/repositories/$DOCKER_USER/
        """, returnStatus: true)

        if (responseCode != 0) {
            error "Failed to create Docker repository. Status: ${responseCode}"
        } else {
            echo "Docker repository '${REPO_NAME}' created successfully."
        }
    }

    stage('Build Docker Image') {
        // Build the Docker image with specified Dockerfile path
        sh "docker build -f ${DOCKERFILE_PATH} -t ${DOCKER_USER}/${REPO_NAME}/${IMAGE_NAME}:${BUILD_NUMBER} ."

        // Login to Docker Hub
        sh "docker login -u $DOCKER_USER -p $DOCKER_PASS"

        // Push the Docker image to Docker Hub
        sh "docker push ${DOCKER_USER}/${REPO_NAME}/${IMAGE_NAME}:${BUILD_NUMBER}"
    }

    stage('Post Build Cleanup') {
        // Clean up: Remove the Docker image after pushing to Docker Hub
        sh "docker rmi ${DOCKER_USER}/${REPO_NAME}/${IMAGE_NAME}:${BUILD_NUMBER}"
    }
}
