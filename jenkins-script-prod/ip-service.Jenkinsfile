node {
  checkout scm
  def imgVersion = "production-${currentBuild.number}"
  def dockerfile =  "jenkins-script-prod/ip-service.Dockerfile"
  def dockerImage = "mukulxinaam/ip-service:${imgVersion}"
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
  }

  stage('Delpoying the App on AKS') {
    sh "chmod +x changeTagProd.sh"
    sh "./changeTagProd.sh ${imgVersion}"

    sh "aws eks update-kubeconfig --region ap-south-1 --name mzaalo-ott-prod"
    sh 'kubectl apply -f jenkins-script-prod/kubectl/ip-service-app-pod.yaml -n prod'
  }

  stage('Mail Send Conformation') {
    mail (to: 'sameer@mzaalo.com',
      subject: "Xfinite-mzaalo-ott-ip-service-backend-prod Job '${env.JOB_NAME}' (${env.BUILD_NUMBER})",
      body: "STARTED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]':<a href='${env.BUILD_URL}'>${env.JOB_NAME} [${env.BUILD_NUMBER}]"
    )
  }
}
