pipeline {
    agent any
    environment {
        DOCKER_CREDENTIALS_ID = 'dockerhub-samanth'
        REPO_NAME = 'production-plan-private1'
        IMAGE_NAME = "samanthwohlig/${REPO_NAME}:hello-world-${env.BUILD_NUMBER}"
        DOCKER_API_URL = 'https://hub.docker.com/v2/repositories'
    }
    stages {
        stage('Checkout SCM') {
            steps {
                checkout scm
            }
        }
        stage('Clean workspace') {
            steps {
                echo "Cleaning Workspace..."
                cleanWs()
            }
        }
        stage('Verify Checkout') {
            steps {
                sh 'ls -l jenkins-script-stage'
            }
        }
        stage('List Workspace') {
            steps {
                sh 'ls -R'
            }
        }
        stage('Check Docker Hub Repository') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
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
        stage('Build docker image') {
            steps {
                sh "docker build -t ${dockerImage} -f ip-service.Dockerfile ."
            }
        }
        stage('Push docker image') {
            when {
                expression { params.PushToregistry == 'Yes' }
            }
            steps {
                withCredentials([usernamePassword(credentialsId: 'devops-docker', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                    sh 'docker login -u $USERNAME -p $PASSWORD'
                }
                sh "docker push ${dockerImage}"
            }
        }
        stage('Delete local docker image') {
            when {
                expression { params.PushToregistry == 'Yes' }
            }
            steps {
                sh "docker rmi ${dockerImage}"
            }
        }
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
