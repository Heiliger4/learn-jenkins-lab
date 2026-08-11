pipeline {
    agent any

    environment {
        IMAGE_NAME = "ongoing-commiter"
        IMAGE_TAG  = "${env.BUILD_NUMBER}"
    }

    options {
        // keep a rolling history instead of unlimited builds
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'node --version'
                sh 'npm install'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build Docker image') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
            }
        }

        stage('Smoke test container') {
            steps {
                sh """
                    docker run -d --rm --name ${IMAGE_NAME}-smoke -p 8001:8001 ${IMAGE_NAME}:${IMAGE_TAG}
                    sleep 2
                    curl -f http://localhost:8001/ || (docker logs ${IMAGE_NAME}-smoke; exit 1)
                    docker stop ${IMAGE_NAME}-smoke
                """
            }
        }

        // Uncomment once you have a registry to push to (Docker Hub, ECR, etc.)
        // stage('Push image') {
        //     steps {
        //         withCredentials([usernamePassword(credentialsId: 'dockerhub-creds',
        //                                            usernameVariable: 'DOCKER_USER',
        //                                            passwordVariable: 'DOCKER_PASS')]) {
        //             sh """
        //                 echo \$DOCKER_PASS | docker login -u \$DOCKER_USER --password-stdin
        //                 docker tag ${IMAGE_NAME}:${IMAGE_TAG} \$DOCKER_USER/${IMAGE_NAME}:${IMAGE_TAG}
        //                 docker push \$DOCKER_USER/${IMAGE_NAME}:${IMAGE_TAG}
        //             """
        //         }
        //     }
        // }
    }

    post {
        always {
            sh "docker rm -f ${IMAGE_NAME}-smoke || true"
        }
        success {
            echo "Build ${IMAGE_TAG} passed."
        }
        failure {
            echo "Build ${IMAGE_TAG} failed."
        }
    }
}
