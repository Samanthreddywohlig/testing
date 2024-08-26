node {
    // Define variables
    def repoName = 'production-plan-private2'
    def imageName = "samanthwohlig/${repoName}:production-plan-private-${env.BUILD_NUMBER}"
    def dockerHubUrl = 'https://hub.docker.com/v2/repositories'
    def imgVersion = "${env.BUILD_NUMBER}"
    def oldBuildsKeep = 3
    def emailRecipients = 'samanth.reddy@wohlig.com'
    def gkeCredentialsId = 'gke-service-account-key'
    def kubectlConfigPath = '/root/.kube/config' // Update with your Kubernetes config path
    def kubeNamespace = 'staging' // Update with your Kubernetes namespace
    def PushToregistry = params.PushToregistry == 'Yes'

    try {
        // Checkout source code
        stage('Checkout and List Files') {
            checkout scm
            echo "Listing files in the workspace after checkout..."
            sh 'ls -la'
        }

        // Verify directory structure
        stage('Verify Directory') {
            echo "Listing files in the directory structure..."
            sh 'ls -la jenkins-script-prod'
            sh 'ls -la jenkins-script-stage'
            sh 'ls -la k8s'
            sh 'pwd'
        }

        // Docker login
        stage('Docker Login') {
            withCredentials([usernamePassword(credentialsId: 'dockerhub-samanth', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                sh "echo ${DOCKER_PASSWORD} | docker login -u ${DOCKER_USERNAME} --password-stdin"
            }
        }

        // Check Docker Hub repository
        stage('Check Docker Hub Repository') {
            withCredentials([usernamePassword(credentialsId: 'dockerhub-samanth', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                def repoCheckCmd = """
                curl -s -u ${DOCKER_USERNAME}:${DOCKER_PASSWORD} -o /dev/null -w "%{http_code}" ${dockerHubUrl}/${DOCKER_USERNAME}/${repoName}/
                """
                def httpResponseCode = sh(script: repoCheckCmd, returnStdout: true).trim()

                if (httpResponseCode == '404') {
                    echo "Repository ${repoName} does not exist. Creating it now."
                    def createRepoCmd = """
                    curl -X POST -u ${DOCKER_USERNAME}:${DOCKER_PASSWORD} ${dockerHubUrl} \
                    -H "Content-Type: application/json" \
                    -d '{
                        "name": "${repoName}",
                        "description": "A private repository for ${repoName}",
                        "is_public": false
                    }'
                    """
                    sh(script: createRepoCmd)
                } else if (httpResponseCode == '200') {
                    echo "Repository ${repoName} already exists."
                } else {
                    error "Unexpected response from Docker Hub: ${httpResponseCode}"
                }
            }
        }

        // Build Docker image
        stage('Build Docker Image') {
            echo "Building Docker image: ${imageName}"
            sh "docker build -t ${imageName} -f jenkins-script-stage/ip-service.Dockerfile ."
        }

        // Push Docker image
        if (PushToregistry) {
            stage('Push Docker Image') {
                echo "Pushing Docker image: ${imageName}"
                sh "docker push ${imageName}"
            }
        }

        // Delete local Docker image
        if (PushToregistry) {
            stage('Delete Local Docker Image') {
                echo "Deleting local Docker image: ${imageName}"
                sh "docker rmi ${imageName}"
            }
        }

        // Deploy to GKE
        if (PushToregistry) {
            stage('Deploying the App on GKE') {
                withCredentials([file(credentialsId: gkeCredentialsId, variable: 'GOOGLE_APPLICATION_CREDENTIALS')]) {
                    script {
                        echo "Authenticating with Google Cloud..."
                        sh 'gcloud auth activate-service-account --key-file=$GOOGLE_APPLICATION_CREDENTIALS'
                        sh "chmod +x jenkins-script-stage/changeTag.sh"
                        sh "./jenkins-script-stage/changeTag.sh ${imgVersion}"
                        echo "Applying Kubernetes configuration..."
                        withEnv(["PATH+EXTRA=/var/lib/jenkins/workspace/google-cloud-sdk/bin:${WORKSPACE}/jenkins-script-stage/kubectl"]) {
                            sh "kubectl apply -f jenkins-script-stage/kubectl/ip-service-stage.yaml -n ${kubeNamespace}"
                            echo "Checking Kubernetes pods status..."
                            sh "kubectl get pods -n ${kubeNamespace}"
                        }
                    }
                }
            }
        }

        // Notify
        stage('Notify') {
            try {
                def buildResult = currentBuild.result ?: 'UNSTABLE'
                def emailSubject = buildResult == 'SUCCESS' ? "Jenkins Pipeline Succeeded: ${env.JOB_NAME} #${env.BUILD_NUMBER}" : "Jenkins Pipeline Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
                def emailBody = "The pipeline ${env.JOB_NAME} #${env.BUILD_NUMBER} ${buildResult.toLowerCase()}.\n\nCheck Jenkins for more details."
                
                emailext(
                    to: emailRecipients,
                    subject: emailSubject,
                    body: emailBody,
                    recipientProviders: [[$class: 'DevelopersRecipientProvider']]
                )
            } catch (Exception mailEx) {
                echo "Failed to send email notification: ${mailEx.getMessage()}"
            }
            echo 'Pipeline finished.'
        }

        // Clean up old builds
        stage('Clean Up Old Builds') {
            if (currentBuild.result == 'SUCCESS') {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-samanth', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                    def buildsToKeep = sh(script: "curl -s -u ${DOCKER_USERNAME}:${DOCKER_PASSWORD} ${dockerHubUrl}/${DOCKER_USERNAME}/${repoName}/tags?page_size=100", returnStdout: true).trim()
                    def tags = readJSON(text: buildsToKeep).results.collect { it.name }
                    tags.sort().reverse().drop(oldBuildsKeep).each { tag ->
                        echo "Deleting old build: ${tag}"
                        sh "curl -s -u ${DOCKER_USERNAME}:${DOCKER_PASSWORD} -X DELETE ${dockerHubUrl}/${DOCKER_USERNAME}/${repoName}/tags/${tag}/"
                    }
                }
            }
        }

    } catch (Exception e) {
        currentBuild.result = 'FAILURE'
        throw e
    } finally {
        // Post actions
        stage('Final Notification') {
            try {
                def buildResult = currentBuild.result ?: 'UNSTABLE'
                def emailSubject = buildResult == 'SUCCESS' ? "Jenkins Pipeline Succeeded: ${env.JOB_NAME} #${env.BUILD_NUMBER}" : "Jenkins Pipeline Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
                def emailBody = "The pipeline ${env.JOB_NAME} #${env.BUILD_NUMBER} ${buildResult.toLowerCase()}.\n\nCheck Jenkins for more details."
                mail to: emailRecipients,
                     subject: emailSubject,
                     body: emailBody
            } catch (Exception mailEx) {
                echo "Failed to send email notification: ${mailEx.getMessage()}"
            }
            echo 'Pipeline finished.'
        }
    }
}
