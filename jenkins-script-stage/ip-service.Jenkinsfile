pipeline {
    agent any
    environment {
        DOCKER_CREDENTIALS_ID = 'dockerhub-samanth'   // Jenkins credentials ID for Docker Hub
        REPO_NAME = 'production-plan-private1'        // Docker Hub repository name
        IMAGE_NAME = "samanthwohlig/${REPO_NAME}:production-plan-private1-${env.BUILD_NUMBER}"
        DOCKER_API_URL = 'https://hub.docker.com/v2/repositories'
    }
    stages {
        stage('Checkout SCM') {
            steps {
                checkout scm
            }
        }

        stage('List Files After Checkout') {
            steps {
                echo "Listing files in the workspace after checkout..."
                sh 'ls -la'
            }
        }

        stage('Verify Directory') {
            steps {
                echo "Listing files in the directory structure..."
                sh 'ls -la jenkins-script-prod'  // Check if the directory exists
                sh 'ls -la jenkins-script-stage' // Check if the directory exists
                sh 'ls -la k8s'                  // Additional directories
            }
        }

        stage('Clean Workspace') {
            steps {
                echo "Cleaning Workspace..."
                cleanWs()
            }
        }

        stage('Check Docker Hub Repository') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                        // Check if the repository exists
                        def repoCheckCmd = """
                        curl -s -u ${DOCKER_USERNAME}:${DOCKER_PASSWORD} -o /dev/null -w "%{http_code}" ${DOCKER_API_URL}/${DOCKER_USERNAME}/${REPO_NAME}/
                        """
                        def httpResponseCode = sh(script: repoCheckCmd, returnStdout: true).trim()

                        if (httpResponseCode == '404') {
                            // Create the repository if it does not exist
                            echo "Repository ${REPO_NAME} does not exist. Creating it now."
                            def createRepoCmd = """
                            curl -X POST -u ${DOCKER_USERNAME}:${DOCKER_PASSWORD} ${DOCKER_API_URL} \
                            -H "Content-Type: application/json" \
                            -d '{
                                "name": "${REPO_NAME}",
                                "description": "A private repository for ${REPO_NAME}",
                                "is_public": true
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
        }

        stage('Build Docker Image') {
            steps {
                script {
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
                    withCredentials([usernamePassword(credentialsId: 'devops-docker', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                        sh 'docker login -u $USERNAME -p $PASSWORD'
                    }
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

        // Uncomment and configure the following stage if you need to deploy to GKE
        // stage('Deploying the App on GKE') {
        //     steps {
        //         withCredentials([file(credentialsId: 'jenkins-service-account-key', variable: 'GOOGLE_APPLICATION_CREDENTIALS')]) {
        //             sh 'whoami'
        //             sh 'gcloud auth activate-service-account --key-file=$GOOGLE_APPLICATION_CREDENTIALS'
        //             sh "chmod +x jenkins-script-stage/changeTag.sh"
        //             sh "./jenkins-script-stage/changeTag.sh ${imgVersion}"
                    
        //             // Apply Kubernetes configuration
        //             sh '''
        //                 #!/bin/bash
        //                 ls ~ -a
        //             '''
        //             sh 'cat ~/.bashrc'
        //             withEnv(["PATH+EXTRA=/usr/local/google-cloud-sdk/bin"]) {
        //                 sh '''
        //                 echo $PATH
        //                 gke-gcloud-auth-plugin
        //                 kubectl get pods
        //                 kubectl apply -f jenkins-script-stage/kubectl/ip-service-stage.yaml -n staging
        //                 '''
        //                 sh 'kubectl get pods -n staging'
        //             }
        //         }
        //     }
        // }
    }
}
