#!/bin/bash
# Setup script for installing system dependencies for IMCP Intranet Backend

set -e

echo "=================================="
echo "IMCP Intranet - Backend Setup"
echo "=================================="
echo ""

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VERSION=$VERSION_ID
else
    echo "Error: Cannot detect operating system"
    exit 1
fi

echo "Detected OS: $OS"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Python version
echo "Checking Python version..."
if ! command_exists python3; then
    echo "Error: Python 3 is not installed"
    exit 1
fi

PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
echo "Found Python $PYTHON_VERSION"

# Warn about Python 3.14+
if command_exists python3 && python3 -c 'import sys; exit(0 if sys.version_info >= (3, 14) else 1)' 2>/dev/null; then
    echo ""
    echo "⚠️  WARNING: You are using Python 3.14 or newer."
    echo "   Many Python packages don't have pre-built wheels for Python 3.14 yet."
    echo "   You will need to build packages from source, which requires all system dependencies."
    echo "   Recommended: Use Python 3.10, 3.11, or 3.12 for better compatibility."
    echo ""
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""

# Install dependencies based on OS
case "$OS" in
    ubuntu|debian)
        echo "Installing system dependencies for Ubuntu/Debian..."
        sudo apt-get update
        sudo apt-get install -y \
            python3-dev \
            python3-venv \
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
        echo "✓ System dependencies installed successfully"
        ;;
    
    fedora|rhel|centos)
        echo "Installing system dependencies for Fedora/RHEL/CentOS..."
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
        echo "✓ System dependencies installed successfully"
        ;;
    
    *)
        echo "⚠️  Unsupported OS: $OS"
        echo ""
        echo "Please manually install the following packages:"
        echo "  - Python development headers (python3-dev)"
        echo "  - GCC compiler (gcc, build-essential)"
        echo "  - LDAP development libraries (libldap2-dev, libsasl2-dev)"
        echo "  - Image libraries (libjpeg-dev, zlib1g-dev, libfreetype6-dev)"
        echo ""
        echo "For detailed instructions, see SETUP.md"
        exit 1
        ;;
esac

echo ""
echo "=================================="
echo "Next Steps:"
echo "=================================="
echo ""
echo "1. Create virtual environment:"
echo "   python3 -m venv venv"
echo ""
echo "2. Activate virtual environment:"
echo "   source venv/bin/activate"
echo ""
echo "3. Upgrade pip:"
echo "   pip install --upgrade pip setuptools wheel"
echo ""
echo "4. Install Python dependencies:"
echo "   pip install -r requirements.txt"
echo ""
echo "5. Configure environment:"
echo "   cp .env.example .env"
echo "   # Edit .env with your settings"
echo ""
echo "6. Run migrations:"
echo "   python manage.py migrate"
echo ""
echo "7. Start development server:"
echo "   python manage.py runserver"
echo ""
echo "For more information, see SETUP.md"
echo ""
