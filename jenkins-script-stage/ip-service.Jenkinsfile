pipeline {
    agent any
    environment {
        REPO_NAME = 'production-plan-private1'        // Docker Hub repository name
        IMAGE_NAME = "samanthwohlig/${REPO_NAME}:ip-service-production-testing-${env.BUILD_NUMBER}"
        DOCKER_API_URL = 'https://hub.docker.com/v2/repositories'
        DOCKER_USERNAME = 'samanthwohlig'
        DOCKER_PASSWORD = 'wohlig@123'
    }
    stages {
        stage('Checkout and List Files') {
            steps {
                checkout scm
                
            }
        }

        

        

        stage('Docker Login') {
            steps {
                sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
            }
        }

        stage('Check Docker Hub Repository') {
            steps {
                script {
                    def repoCheckCmd = """
                    curl -s -u ${DOCKER_USERNAME}:${DOCKER_PASSWORD} -o /dev/null -w "%{http_code}" ${DOCKER_API_URL}/${DOCKER_USERNAME}/${REPO_NAME}/
                    """
                    def httpResponseCode = sh(script: repoCheckCmd, returnStdout: true).trim()

                    if (httpResponseCode == '404') {
                        echo "Repository ${REPO_NAME} does not exist. Creating it now."
                        def createRepoCmd = """
                        curl -X POST -u ${DOCKER_USERNAME}:${DOCKER_PASSWORD} ${DOCKER_API_URL} \
                        -H "Content-Type: application/json" \
                        -d '{
                            "name": "${REPO_NAME}",
                            "description": "A private repository for ${REPO_NAME}",
                            "is_public": false
                        }'
                        """
                        sh(script: createRepoCmd)
                    } else if (httpResponseCode == '200') {
                        echo "Repository ${REPO_NAME} already exists."
                    } else {
                        error "Unexpected response from Docker Hub: ${httpResponseCode}"
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    sh 'pwd'
                    sh 'ls -la'
                    def dockerImage = "${IMAGE_NAME}"
                    sh "docker build -t ${dockerImage} -f jenkins-script-stage/ip-service.Dockerfile ."
                }
            }
        }

        stage('Push Docker Image') {
            when {
                expression { params.PushToregistry == 'Yes' }
            }
            steps {
                script {
                    def dockerImage = "${IMAGE_NAME}"
                    sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin'
                    sh "docker push ${dockerImage}"
                }
            }
        }

        stage('Delete Local Docker Image') {
            when {
                expression { params.PushToregistry == 'Yes' }
            }
            steps {
                script {
                    def dockerImage = "${IMAGE_NAME}"
                    sh "docker rmi ${dockerImage}"
                }
            }
        }

       stage('Deploying the App on GKE') {
        withCredentials([file(credentialsId: 'jenkins-service-account-key', variable: 'GOOGLE_APPLICATION_CREDENTIALS')]) {
            sh 'whoami'
            sh 'gcloud auth activate-service-account --key-file=$GOOGLE_APPLICATION_CREDENTIALS'
            sh "chmod +x jenkins-script-stage/changeTag.sh"
            sh "./jenkins-script-stage/changeTag.sh ${imgVersion}"
            
            // Apply kubernetes configuration
            sh '''
                #!/bin/bash
                ls ~ -a
            '''
            sh 'cat ~/.bashrc'
            withEnv(["PATH+EXTRA=/usr/local/google-cloud-sdk/bin"]) {
            // /var/lib/jenkins/workspace/gcp-search-staging/jenkins-script-stage/kubectl:/var/lib/jenkins/workspace/search-staging/google-cloud-sdk/bin
                sh '''
                echo $PATH
                gke-gcloud-auth-plugin
                kubectl get pods
                kubectl apply -f jenkins-script-stage/kubectl/ip-service-stage.yaml -n staging
                '''
                sh 'kubectl get pods -n staging'
            }
        }
    }
}
