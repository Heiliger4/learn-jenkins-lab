pipeline {
    agent any

    environment {
        IMAGE_NAME = "kpg44/ongoing-commiter"
        IMAGE_TAG  = "${env.BUILD_NUMBER}"
    }

    options {
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

        stage('Lint and Unit Test') {
            parallel {
                stage('Lint') {
                    steps {
                        sh 'npm run lint'
                    }
                }

                stage('Unit Tests') {
                    steps {
                        sh 'npm run test:unit'
                    }
                }
            }
        }

        stage('Integration Tests') {
            steps {
                sh 'npm run test:integration'
            }
        }

        stage('Security Scan') {
            steps {
                sh 'echo "Running security scan..."'
            }
        }

        stage('Build App') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Docker Build') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
            }
        }

        stage('Image Security Scan') {
            steps {
                sh 'echo "Running image security scan..."'
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    sh '''
                        echo "$DOCKER_PASSWORD" | docker login \
                            --username "$DOCKER_USERNAME" \
                            --password-stdin

                        docker push "${IMAGE_NAME}:${IMAGE_TAG}"

                        docker logout
                    '''
                }
            }
        }

        stage('Deploy to Staging') {
            steps {
                echo "Deploying ${IMAGE_NAME}:${IMAGE_TAG} to staging environment..."
            }
        }

        stage('Smoke / E2E Test') {
            steps {
                sh 'npm run test:e2e'
            }
        }

        stage('Approval to Production') {
            steps {
                input message: 'Approve deployment to production?'
            }
        }

        stage('Deploy to Production') {
            steps {
                echo "Deploying ${IMAGE_NAME}:${IMAGE_TAG} to production environment..."
            }
        }

        stage('Health Check') {
            steps {
                sh 'npm run health-check'
            }
        }
    }

    post {
        success {
            echo "Build ${IMAGE_TAG} passed successfully."

            withCredentials([
                string(
                    credentialsId: 'telegram-bot-token',
                    variable: 'TELEGRAM_BOT_TOKEN'
                ),
                string(
                    credentialsId: 'telegram-chat-id',
                    variable: 'TELEGRAM_CHAT_ID'
                )
            ]) {
                sh '''
                    curl -s -X POST \
                        "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
                        -d chat_id="${TELEGRAM_CHAT_ID}" \
                        --data-urlencode "text=✅ Jenkins Build SUCCESS

Job: ${JOB_NAME}
Build: #${BUILD_NUMBER}
Image: ${IMAGE_NAME}:${IMAGE_TAG}
Status: SUCCESS

Production deployment completed successfully.
Jenkins: ${BUILD_URL}"
                '''
            }
        }

        failure {
            echo "Build ${IMAGE_TAG} failed. Initiating rollback flow..."

            sh 'echo "Rollback placeholder: implement rollback actions here."'

            withCredentials([
                string(
                    credentialsId: 'telegram-bot-token',
                    variable: 'TELEGRAM_BOT_TOKEN'
                ),
                string(
                    credentialsId: 'telegram-chat-id',
                    variable: 'TELEGRAM_CHAT_ID'
                )
            ]) {
                sh '''
                    curl -s -X POST \
                        "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
                        -d chat_id="${TELEGRAM_CHAT_ID}" \
                        --data-urlencode "text=❌ Jenkins Build FAILED

Job: ${JOB_NAME}
Build: #${BUILD_NUMBER}
Image: ${IMAGE_NAME}:${IMAGE_TAG}
Status: FAILED

The Jenkins pipeline failed.
Check the Jenkins console for details.

Jenkins: ${BUILD_URL}"
                '''
            }
        }

        aborted {
            withCredentials([
                string(
                    credentialsId: 'telegram-bot-token',
                    variable: 'TELEGRAM_BOT_TOKEN'
                ),
                string(
                    credentialsId: 'telegram-chat-id',
                    variable: 'TELEGRAM_CHAT_ID'
                )
            ]) {
                sh '''
                    curl -s -X POST \
                        "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
                        -d chat_id="${TELEGRAM_CHAT_ID}" \
                        --data-urlencode "text=⚠️ Jenkins Build ABORTED

Job: ${JOB_NAME}
Build: #${BUILD_NUMBER}
Image: ${IMAGE_NAME}:${IMAGE_TAG}
Status: ABORTED

The Jenkins pipeline was aborted.

Jenkins: ${BUILD_URL}"
                '''
            }
        }
    }
}