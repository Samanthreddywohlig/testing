node {
  checkout scm
  def imgVersion = "ip-service-${currentBuild.number}"
  def dockerfile =  "jenkins-script-prod/ip-service.Dockerfile"
  def dockerImage = "mukulxinaam/gcp-stag-ip-service:${imgVersion}" //Update GCR image path
  def Namespace = "default"
  def PushToregistry = false
  stage('Clean workspace') {
    echo "Clean Workspace::"
    
  }
  // stage('Setup') {
  //       // Set environment variable within this stage
  //       withEnv(["PATH+EXTRA=/var/lib/jenkins/workspace/ipservice-staging/jenkins-script-prod/kubectl/google-cloud-sdk/bin"]) {
  //           sh '''
  //           echo $PATH
  //           gke-gcloud-auth-plugin
  //           '''
  //       }
  //   }

  if (params.PushToregistry == 'No'){
    stage('Build docker image') {
      sh "docker build -t ${dockerImage} -f ${dockerfile} ."
    }
  }
  
  if (params.PushToregistry == 'Yes'){
    // Connect to Artifact Registry
    stage('Build docker image') {
      sh "docker build -t ${dockerImage} -f ${dockerfile} ."
    }
    // Push Docker Image to Artifact Registry
    stage('Authenticate to Google Cloud using workload identity federation') {
    }
    stage('Push docker image') {
      withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId:'devops-docker', usernameVariable: 'USERNAME', passwordVariable: 'PASSWORD']]){
        sh 'docker login -u $USERNAME -p $PASSWORD'
      }
        sh "docker push ${dockerImage}"
    }
  }
  stage('Delpoying the App on GKE') {
  withCredentials([file(credentialsId: 'jenkins-service-account-key', variable: 'GOOGLE_APPLICATION_CREDENTIALS')]) {
    sh 'whoami'
    sh 'gcloud auth activate-service-account --key-file=$GOOGLE_APPLICATION_CREDENTIALS'
    sh "chmod +x changeTagProd.sh"
    sh "./changeTagProd.sh ${imgVersion}"
  
  //Update kubeconfig
//     sh 'gcloud container clusters get-credentials clst-xf-staging --region asia-south1 --project prj-xf-mzaalo-staging'
//    sh 'ls -l jenkins-script-prod/kubectl'
//  sh 'pwd'

//   sh 'cat jenkins-script-prod/kubectl/ip-service-app-pod.yaml'

  //Apply kubernetes configuration 
//  sh '/var/lib/jenkins/workspace/ipservice-staging/jenkins-script-prod/kubectl/google-cloud-sdk/bin/gke-gcloud-auth-plugin'
  sh '''
        #!/bin/bash
        ls ~ -a
        '''
  sh 'cat ~/.bashrc'
    withEnv(["PATH+EXTRA=/var/lib/jenkins/workspace/ipservice-staging/jenkins-script-prod/kubectl/google-cloud-sdk/bin"]) {
            sh '''
            echo $PATH
            gke-gcloud-auth-plugin
            kubectl get pods
            kubectl apply -f jenkins-script-prod/kubectl/ip-service-app-pod.yaml -n staging
            '''
        }
  }
}

  // stage('Mail Send Conformation') {
  //   mail (to: 'samanth.reddy@wohlig.com',
  //     subject: "Xfinite-mzaalo-ott-ip-service-backend-stag Job '${env.JOB_NAME}' (${env.BUILD_NUMBER})",
  //     body: "STARTED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]':<a href='${env.BUILD_URL}'>${env.JOB_NAME} [${env.BUILD_NUMBER}]"
  //   )
  // }
}
