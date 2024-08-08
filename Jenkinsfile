node {
    def DOCKER_USER = 'samanthwohlig'  // Docker Hub username
    def DOCKER_PASS = 'wohlig@123'     // Docker Hub password
    def REPO_NAME = 'production-testing'
    def IMAGE_NAME = 'hello-world'
    def IMAGE_TAG = 'latest'
    def DOCKERFILE_PATH = 'Dockerfile'  // Relative path to Dockerfile

    stage('Checkout') {
        checkout scm
    }

    stage('Docker Login') {
        sh "docker login -u ${DOCKER_USER} -p ${DOCKER_PASS}"
    }
    stage('Create Docker Repository') {
        try {
            def response = sh(script: """
                curl -X POST \
                  -H "Content-Type: application/json" \
                  -u $DOCKER_USER:$DOCKER_PASS \
                  -d '{"name":"${REPO_NAME}","description":"Repository for production testing","is_private":false}' \
                  https://hub.docker.com/v2/repositories/$DOCKER_USER/
            """, returnStdout: true)

            echo "Docker repository '${REPO_NAME}' created successfully."
        } catch (Exception e) {
            error "Failed to create Docker repository: ${e.message}"
        }
    }

    stage('Build and Push Docker Image') {
        try {
            def dockerImage = docker.build("${DOCKER_USER}/${REPO_NAME}/${IMAGE_NAME}:${IMAGE_TAG}", "-f ${DOCKERFILE_PATH} .")
            dockerImage.push()
            echo "Successfully pushed Docker image '${DOCKER_USER}/${REPO_NAME}/${IMAGE_NAME}:${IMAGE_TAG}' to Docker Hub."
        } catch (Exception e) {
            error "Failed to build or push Docker image: ${e.message}"
        } finally {
            // Clean up: Remove the Docker image after pushing to Docker Hub
            sh "docker rmi ${DOCKER_USER}/${REPO_NAME}/${IMAGE_NAME}:${IMAGE_TAG}"
        }
    }

    stage('Post Build Cleanup') {
        // Additional cleanup if needed
    }

    try {
        // Logout from Docker Hub after the job finishes
        sh "docker logout"
    } catch (Exception ignore) {
        // Ignore errors during logout
    }
}
