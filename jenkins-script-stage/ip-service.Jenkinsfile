pipeline {
    agent any

    environment {
        DOCKER_CREDENTIALS_ID = 'dockerhub-samanth'   // Jenkins credentials ID for Docker Hub
        REPO_NAME = 'production-plan-private1'          // Docker Hub repository name
        IMAGE_NAME = "samanthwohlig/${REPO_NAME}:hello-world-${env.BUILD_NUMBER}"
        DOCKER_API_URL = 'https://hub.docker.com/v2/repositories'
    }

    stages {
        stage('Clean workspace') {
            steps {
                echo "Cleaning Workspace..."
                cleanWs()  // Optional: This will clean the workspace.
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

        stage('Build docker image') {
            when {
                expression {
                    return params.PushToregistry == 'Yes' || params.PushToregistry == 'No'
                }
            }
            steps {
                script {
                    def imgVersion = "staging-${currentBuild.number}"
                    def dockerfile = "jenkins-script-stage/ip-service.Dockerfile"
                    def dockerImage = "samanthwohlig/production-plan-private1:${imgVersion}"
                    
                    sh "docker build -t ${dockerImage} -f ${dockerfile} ."
                }
            }
        }

        stage('Push docker image') {
            when {
                expression {
                    return params.PushToregistry == 'Yes'
                }
            }
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: 'devops-docker', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD')]) {
                        sh 'docker login -u $USERNAME -p $PASSWORD'
                    }
                    sh "docker push ${dockerImage}"
                }
            }
        }

        stage('Delete local docker image') {
            when {
                expression {
                    return params.PushToregistry == 'Yes'
                }
            }
            steps {
                script {
                    def imgVersion = "staging-${currentBuild.number}"
                    def dockerImage = "samanthwohlig/production-plan-private1:${imgVersion}"
                    sh "docker rmi ${dockerImage}"
                }
            }
        }

        // stage('Deploying the App on GKE') {
        //     steps {
        //         withCredentials([file(credentialsId: 'jenkins-service-account-key', variable: 'GOOGLE_APPLICATION_CREDENTIALS')]) {
        //             sh 'whoami'
        //             sh 'gcloud auth activate-service-account --key-file=$GOOGLE_APPLICATION_CREDENTIALS'
        //             sh "chmod +x jenkins-script-stage/changeTag.sh"
        //             sh "./jenkins-script-stage/changeTag.sh ${imgVersion}"
                    
        //             // Apply kubernetes configuration
        //             sh '''
        //                 #!/bin/bash
        //                 ls ~ -a
        //             '''
        //             sh 'cat ~/.bashrc'
        //             withEnv(["PATH+EXTRA=/usr/local/google-cloud-sdk/bin"]) {
        //             // /var/lib/jenkins/workspace/gcp-search-staging/jenkins-script-stage/kubectl:/var/lib/jenkins/workspace/search-staging/google-cloud-sdk/bin
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

    // Post actions can be added here if needed
}
