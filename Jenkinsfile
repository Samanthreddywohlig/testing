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

    stage('Verify Docker Repository Creation') {
            steps {
                script {
                    sh '''
                        response=$(curl -u samanthwohlig:wohlig@123 https://hub.docker.com/v2/repositories/samanthwohlig/)
                        echo "Repository response: $response"
                    '''
                }
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
