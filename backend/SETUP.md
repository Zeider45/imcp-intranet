# Backend Setup Guide

## System Requirements

### Python Version
- **Recommended**: Python 3.10, 3.11, or 3.12
- **Not Recommended**: Python 3.14+ (packages may not have pre-built wheels)

### System Dependencies

The backend requires several system libraries for building Python packages:

#### Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install -y \
    python3-dev \
    build-essential \
    gcc \
    libldap2-dev \
    libsasl2-dev \
    libssl-dev \
    libjpeg-dev \
    zlib1g-dev \
    libfreetype6-dev \
    liblcms2-dev \
    libopenjp2-7-dev \
    libtiff5-dev \
    libwebp-dev
```

#### Fedora/RHEL/CentOS
```bash
sudo dnf install -y \
    python3-devel \
    gcc \
    gcc-c++ \
    openldap-devel \
    cyrus-sasl-devel \
    openssl-devel \
    libjpeg-turbo-devel \
    zlib-devel \
    freetype-devel \
    lcms2-devel \
    openjpeg2-devel \
    libtiff-devel \
    libwebp-devel
```

#### macOS
```bash
brew install \
    openldap \
    sasl2 \
    openssl@3 \
    jpeg \
    zlib \
    freetype \
    lcms2 \
    openjpeg \
    libtiff \
    webp
```

## Installation Steps

### 1. Install System Dependencies

Run the appropriate command for your operating system from the section above.

### 2. Create Virtual Environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Upgrade pip

```bash
pip install --upgrade pip setuptools wheel
```

### 4. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure Environment Variables

```bash
cp .env.example .env
# Edit .env with your specific configurations
```

### 6. Run Migrations

```bash
python manage.py migrate
```

### 7. Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

### 8. Start Development Server

```bash
python manage.py runserver
```

## Troubleshooting

### Issue: "gcc-12: command not found"

**Problem**: The build system is trying to use a specific gcc version that doesn't exist.

**Solution**:
1. Install the default gcc compiler for your system
2. On Ubuntu/Debian: `sudo apt-get install build-essential gcc`
3. On Fedora/RHEL: `sudo dnf install gcc gcc-c++`

The build system will use the default gcc if a specific version is not available.

### Issue: "lber.h: No such file or directory"

**Problem**: LDAP development headers are missing.

**Solution**:
- Ubuntu/Debian: `sudo apt-get install libldap2-dev libsasl2-dev`
- Fedora/RHEL: `sudo dnf install openldap-devel cyrus-sasl-devel`
- macOS: `brew install openldap`

### Issue: Building Pillow fails

**Problem**: Image library development headers are missing.

**Solution**:
- Ubuntu/Debian: `sudo apt-get install libjpeg-dev zlib1g-dev libfreetype6-dev`
- Fedora/RHEL: `sudo dnf install libjpeg-turbo-devel zlib-devel freetype-devel`
- macOS: `brew install jpeg zlib freetype`

### Issue: Python 3.14 compatibility

**Problem**: Python 3.14 is very new and many packages don't have pre-built wheels yet.

**Solution**:
1. Use Python 3.10, 3.11, or 3.12 instead
2. Or install all system dependencies so packages can be built from source

### Issue: "command '/usr/bin/x86_64-linux-gnu-gcc' failed"

**Problem**: Missing system libraries needed for compilation.

**Solution**: Install all system dependencies listed above for your operating system.

## Alternative: Using Docker

If you encounter persistent issues with system dependencies, consider using Docker:

```dockerfile
FROM python:3.12-slim

RUN apt-get update && apt-get install -y \
    gcc \
    libldap2-dev \
    libsasl2-dev \
    libssl-dev \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
```

## Environment Validation

To check if your environment is properly set up, you can run:

```bash
# Check Python version
python --version

# Check if gcc is available
gcc --version

# Check if LDAP libraries are installed
ldconfig -p | grep ldap

# Test pip installation
pip install --upgrade pip
```
