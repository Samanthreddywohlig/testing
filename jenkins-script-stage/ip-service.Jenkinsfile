node {
  
  checkout scm
  def imgVersion = "staging-${currentBuild.number}"
  def dockerfile = "jenkins-script-stage/ip-service.Dockerfile"
  def dockerImage = "mukulxinaam/gcp-stag-ip-service:${imgVersion}"
  def Namespace = "default"
  def PushToregistry = false

    stage('Clean workspace') {
      echo "Clean Workspace::"
    }

  if (params.PushToregistry == 'No'){
    stage('Build docker image') {
     sh "docker build -t ${dockerImage} -f ${dockerfile} ."
    }
  }
  
 if (params.PushToregistry == 'Yes'){
    stage('Build docker image') {
      sh "docker build -t ${dockerImage} -f ${dockerfile} ."
    }
    stage('Push docker image') {

       withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId:'devops-docker', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD']]){
             sh 'docker login -u $USERNAME -p $PASSWORD'
        }
            sh "docker push ${dockerImage}"
    }
  stage('Delete local docker image') {
      sh "docker rmi ${dockerImage}"
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