# Security Guide

## 🔒 Secret Management

This project uses multiple layers of security to protect sensitive information.

### ✅ What We've Implemented

1. **Environment Variables**: No hardcoded secrets in code
2. **Kubernetes Secrets**: Secure secret management in K8s
3. **Git Ignore**: Sensitive files excluded from version control
4. **Base64 Encoding**: Secrets encoded in Kubernetes

### 🛡️ Security Layers

#### 1. **Code Level**
- ✅ No hardcoded credentials in source code
- ✅ Environment variables with fallbacks
- ✅ TypeScript type safety

#### 2. **Git Level**
- ✅ `.gitignore` excludes sensitive files
- ✅ No secrets in commit history
- ✅ GitHub secret scanning protection

#### 3. **Kubernetes Level**
- ✅ Kubernetes Secrets for sensitive data
- ✅ Secret references in deployments
- ✅ Base64 encoding for storage

### 📁 File Structure

```
microservices_poc/
├── .gitignore                 # Excludes sensitive files
├── .env.example              # Template for environment variables
├── k8s-secrets/              # Kubernetes secrets (DO NOT COMMIT)
│   └── app-hello-world-secret.yaml
├── k8s/                      # Kubernetes manifests
└── app-hello-world/          # Application code
```

### 🔧 How to Use

#### **For Local Development:**

1. **Copy environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Edit your local environment:**
   ```bash
   # .env.local (DO NOT COMMIT)
   AWS_ACCESS_KEY_ID=your-real-key
   AWS_SECRET_ACCESS_KEY=your-real-secret
   ```

3. **Run locally:**
   ```bash
   npm start
   ```

#### **For Kubernetes Deployment:**

1. **Create your secret:**
   ```bash
   # Edit k8s-secrets/app-hello-world-secret.yaml
   # Replace the base64 encoded values with your real credentials
   ```

2. **Deploy with Skaffold:**
   ```bash
   skaffold dev --port-forward
   ```

### 🔐 Secret Management Options

#### **Option 1: Kubernetes Secrets (Current)**
```yaml
# k8s-secrets/app-hello-world-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-hello-world-secret
type: Opaque
data:
  aws-access-key-id: <base64-encoded-value>
  aws-secret-access-key: <base64-encoded-value>
```

#### **Option 2: External Secret Management**
- **AWS Secrets Manager**
- **HashiCorp Vault**
- **Azure Key Vault**

#### **Option 3: CI/CD Secrets**
- **GitHub Secrets**
- **GitLab CI Variables**
- **Jenkins Credentials**

### 🚨 Security Best Practices

#### **DO:**
- ✅ Use environment variables
- ✅ Use Kubernetes secrets
- ✅ Use external secret management in production
- ✅ Rotate secrets regularly
- ✅ Use least privilege access
- ✅ Monitor secret access

#### **DON'T:**
- ❌ Hardcode secrets in code
- ❌ Commit secrets to git
- ❌ Use default/test credentials in production
- ❌ Share secrets in plain text
- ❌ Store secrets in config files

### 🔍 Security Checklist

- [ ] No hardcoded secrets in source code
- [ ] Environment variables used for configuration
- [ ] Kubernetes secrets for sensitive data
- [ ] `.gitignore` excludes sensitive files
- [ ] No secrets in commit history
- [ ] GitHub secret scanning enabled
- [ ] Production secrets different from development
- [ ] Secret rotation policy in place

### 🛠️ Troubleshooting

#### **Secret Not Found Error:**
```bash
# Check if secret exists
kubectl get secrets

# Create secret manually
kubectl create secret generic app-hello-world-secret \
  --from-literal=aws-access-key-id=test \
  --from-literal=aws-secret-access-key=test \
  --from-literal=aws-region=us-east-1
```

#### **Environment Variables Not Loading:**
```bash
# Check pod environment
kubectl exec -it <pod-name> -- env | grep AWS

# Check secret content
kubectl get secret app-hello-world-secret -o yaml
```

### 📚 Additional Resources

- [Kubernetes Secrets](https://kubernetes.io/docs/concepts/configuration/secret/)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/)
- [HashiCorp Vault](https://www.vaultproject.io/)

---

**Remember: Security is an ongoing process, not a one-time setup! 🔒**
