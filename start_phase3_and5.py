#!/usr/bin/env python3
"""
PHASE 3 & 5: QUICK START SCRIPT
================================

This script helps you get Phase 3 (Blob Storage) and Phase 5 (Application Insights)
running in 2 hours.

Usage:
    python start_phase3_and5.py
"""

import os
import sys
from pathlib import Path

def print_header(text):
    print("\n" + "="*70)
    print(f"🚀 {text}")
    print("="*70 + "\n")

def print_step(num, text):
    print(f"   Step {num}: {text}")

def check_env_file():
    """Check if .env file exists and has required variables."""
    print_header("CHECKING ENVIRONMENT")
    
    env_path = Path("backend/.env")
    
    if not env_path.exists():
        print("❌ backend/.env not found!")
        print("\n   Create it with:")
        print("   - Copy backend/.env.example to backend/.env")
        print("   - Or follow READY_FOR_SUBMISSION.md for setup")
        return False
    
    required_vars = [
        "BLOB_STORAGE_ENABLED",
        "AZURE_STORAGE_ACCOUNT_NAME",
        "AZURE_STORAGE_CONTAINER_NAME",
        "AZURE_STORAGE_ACCOUNT_KEY",
        "APP_INSIGHTS_ENABLED",
        "APPLICATIONINSIGHTS_CONNECTION_STRING"
    ]
    
    print("✅ backend/.env exists")
    print("\n   Required variables for Phase 3 & 5:")
    
    with open(env_path) as f:
        content = f.read()
        
    found = []
    missing = []
    
    for var in required_vars:
        if var in content:
            found.append(var)
            print(f"      ✅ {var}")
        else:
            missing.append(var)
            print(f"      ❌ {var}")
    
    if missing:
        print(f"\n   ⚠️  Missing {len(missing)} variables!")
        print("   See READY_FOR_SUBMISSION.md for setup instructions")
        return False
    
    return True

def check_azure_services():
    """Check if Azure service files exist."""
    print_header("CHECKING AZURE SERVICE FILES")
    
    services = [
        ("Blob Storage", "backend/services/azure_blob_service.py"),
        ("Monitoring", "backend/services/azure_monitoring_service.py"),
        ("Configuration", "backend/config/azure_config.py"),
    ]
    
    all_exist = True
    
    for name, path in services:
        if os.path.exists(path):
            print(f"   ✅ {name}: {path}")
        else:
            print(f"   ❌ {name}: {path} (NOT FOUND)")
            all_exist = False
    
    return all_exist

def check_test_files():
    """Check if test files exist."""
    print_header("CHECKING TEST FILES")
    
    tests = [
        ("Blob Storage Tests", "backend/test_phase3_blob_storage.py"),
        ("Monitoring Tests", "backend/test_phase5_monitoring.py"),
        ("Full Demo", "backend/demo_phase3_and_5.py"),
    ]
    
    all_exist = True
    
    for name, path in tests:
        if os.path.exists(path):
            print(f"   ✅ {name}")
        else:
            print(f"   ❌ {name}: {path} (NOT FOUND)")
            all_exist = False
    
    return all_exist

def show_next_steps():
    """Show what to do next."""
    print_header("NEXT STEPS TO GET EVERYTHING WORKING")
    
    print("\n⏱️  TIMELINE: 2 Hours Total\n")
    
    print("📋 STEP 1: Set Up Azure Resources (45 minutes)")
    print_step(1, "Create Azure Storage Account")
    print("      Portal: Storage Accounts → Create")
    print("      Name: alumunity (or with unique suffix)")
    print("")
    
    print_step(2, "Create Blob Container")
    print("      Name: alumunity")
    print("      Access level: Private")
    print("")
    
    print_step(3, "Create Application Insights")
    print("      Portal: Application Insights → Create")
    print("      Name: alumunity-insights")
    print("")
    
    print("\n⚙️  STEP 2: Update .env File (15 minutes)")
    print_step(1, "Get credentials from Azure Portal")
    print("      - Storage account name")
    print("      - Storage account key")
    print("      - Application Insights connection string")
    print("")
    
    print_step(2, "Update backend/.env with credentials")
    print("      See READY_FOR_SUBMISSION.md for exact values")
    print("")
    
    print("\n🧪 STEP 3: Run Tests (20 minutes)")
    print_step(1, "Test Blob Storage")
    print("      Command: python backend/test_phase3_blob_storage.py")
    print("")
    
    print_step(2, "Test Application Insights")
    print("      Command: python backend/test_phase5_monitoring.py")
    print("")
    
    print_step(3, "Run Full Demo")
    print("      Command: python backend/demo_phase3_and_5.py")
    print("")
    
    print("\n🔌 STEP 4: Integrate into Backend (optional, 30 minutes)")
    print_step(1, "Copy code from PHASE_3_AND_5_INTEGRATION_GUIDE.md")
    print("      - Add imports to server.py")
    print("      - Initialize monitoring")
    print("      - Add upload/download endpoints")
    print("")
    
    print("\n✅ STEP 5: You're Done!")
    print("   - Files stored in Azure cloud")
    print("   - Metrics visible in Azure Portal")
    print("   - Ready to submit to Imagine Cup!")
    print("")

def show_documentation():
    """Show available documentation."""
    print_header("DOCUMENTATION FILES")
    
    docs = [
        ("READY_FOR_SUBMISSION.md", "2-hour implementation timeline"),
        ("PHASE_3_AND_5_SUMMARY.md", "Quick reference and checklist"),
        ("PHASE_3_AND_5_INTEGRATION_GUIDE.md", "Copy-paste code for server.py"),
        ("PHASE_3_AND_5_QUICKSTART.md", "Azure Portal + CLI setup"),
    ]
    
    print("   📖 Available Documentation:\n")
    
    for filename, description in docs:
        if os.path.exists(filename):
            print(f"      ✅ {filename}")
            print(f"         → {description}\n")
        else:
            print(f"      ❌ {filename} (not found)\n")

def main():
    """Main startup sequence."""
    os.chdir(Path(__file__).parent)
    
    print("\n" + "="*70)
    print("  🎯 PHASE 3 & 5 IMPLEMENTATION - QUICK START")
    print("  Azure Blob Storage + Application Insights")
    print("="*70)
    
    # Check files
    blob_ok = check_azure_services()
    tests_ok = check_test_files()
    env_ok = check_env_file()
    
    # Show summary
    print_header("STATUS SUMMARY")
    
    if blob_ok and tests_ok:
        print("✅ All code files present")
    else:
        print("❌ Some code files missing - check git clone")
    
    if env_ok:
        print("✅ Environment configured")
        print("\n   You're ready to run tests!")
    else:
        print("❌ Environment not configured")
        print("\n   First, follow these steps:")
    
    # Show documentation
    show_documentation()
    
    # Show next steps
    show_next_steps()
    
    # Final instructions
    print_header("QUICK COMMAND REFERENCE")
    
    print("   Test Blob Storage:")
    print("      python backend/test_phase3_blob_storage.py\n")
    
    print("   Test Application Insights:")
    print("      python backend/test_phase5_monitoring.py\n")
    
    print("   Run Full Demo:")
    print("      python backend/demo_phase3_and_5.py\n")
    
    print("   Read Setup Guide:")
    print("      cat READY_FOR_SUBMISSION.md\n")
    
    print_header("YOU'RE ALL SET! 🚀")
    
    print("   Next: Follow the READY_FOR_SUBMISSION.md timeline")
    print("   Questions? Check PHASE_3_AND_5_INTEGRATION_GUIDE.md")
    print("   Troubleshooting? See PHASE_3_AND_5_SUMMARY.md")
    print("\n")

if __name__ == "__main__":
    main()
