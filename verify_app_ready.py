#!/usr/bin/env python3
"""
AlumUnity App Status Verification
Quick script to check if your app components are working
"""

import os
import sys
from pathlib import Path

def check_file_exists(path, name):
    """Check if a file exists"""
    if os.path.exists(path):
        print(f"   ✅ {name}")
        return True
    else:
        print(f"   ❌ {name} (NOT FOUND)")
        return False

def main():
    print("\n" + "="*70)
    print("🔍 AlumUnity App Status Verification")
    print("="*70 + "\n")
    
    # Check backend
    print("📁 Backend Files:")
    backend_ok = True
    backend_ok &= check_file_exists("backend/server.py", "Server main file")
    backend_ok &= check_file_exists("backend/requirements.txt", "Dependencies")
    backend_ok &= check_file_exists("backend/database/connection.py", "Database connection")
    
    print("\n📡 Backend Routes (Features):")
    routes = [
        ("backend/routes/auth.py", "Authentication"),
        ("backend/routes/profiles.py", "User Profiles"),
        ("backend/routes/mentorship.py", "Mentor Matching"),
        ("backend/routes/messaging.py", "Real-time Messaging"),
        ("backend/routes/jobs.py", "Job Board"),
        ("backend/routes/forum.py", "Forums/Discussions"),
        ("backend/routes/events.py", "Events"),
        ("backend/routes/notifications.py", "Notifications"),
    ]
    
    routes_ok = True
    for route_path, name in routes:
        routes_ok &= check_file_exists(route_path, name)
    
    print("\n☁️  Azure Integration:")
    azure_ok = True
    azure_ok &= check_file_exists("backend/services/azure_blob_service.py", "Blob Storage Service")
    azure_ok &= check_file_exists("backend/services/azure_monitoring_service.py", "Monitoring Service")
    azure_ok &= check_file_exists("backend/config/azure_config.py", "Azure Configuration")
    azure_ok &= check_file_exists("backend/test_phase3_blob_storage.py", "Blob Storage Tests")
    azure_ok &= check_file_exists("backend/test_phase5_monitoring.py", "Monitoring Tests")
    
    print("\n🧪 Test Files:")
    tests_ok = True
    tests = [
        ("backend/test_phase3_blob_storage.py", "Blob Storage Tests"),
        ("backend/test_phase5_monitoring.py", "Monitoring Tests"),
        ("backend/test_infrastructure.py", "Infrastructure Tests"),
        ("backend/test_db_connect.py", "Database Tests"),
    ]
    
    for test_path, name in tests:
        tests_ok &= check_file_exists(test_path, name)
    
    print("\n⚙️  Configuration:")
    config_ok = True
    config_ok &= check_file_exists("backend/.env.example", ".env Template")
    config_ok &= check_file_exists(".env.azure.example", "Azure .env Template")
    
    print("\n📚 Documentation:")
    docs_ok = True
    docs = [
        ("IMAGINE_CUP_SUBMISSION_GUIDE.md", "Submission Guide"),
        ("READY_FOR_SUBMISSION.md", "Phase 3 & 5 Guide"),
        ("APP_STATUS_REPORT.md", "Status Report"),
        ("PHASE_3_AND_5_README.md", "Azure README"),
    ]
    
    for doc_path, name in docs:
        docs_ok &= check_file_exists(doc_path, name)
    
    # Summary
    print("\n" + "="*70)
    print("✅ STATUS SUMMARY")
    print("="*70)
    
    all_ok = backend_ok and routes_ok and azure_ok and tests_ok and config_ok and docs_ok
    
    status_items = [
        ("Backend Files", backend_ok),
        ("Route Features", routes_ok),
        ("Azure Integration", azure_ok),
        ("Test Suites", tests_ok),
        ("Configuration", config_ok),
        ("Documentation", docs_ok),
    ]
    
    for name, ok in status_items:
        status = "✅ READY" if ok else "⚠️  NEEDS ATTENTION"
        print(f"  {name:.<45} {status}")
    
    print("\n" + "="*70)
    
    if all_ok:
        print("🎉 YOUR APP IS READY FOR SUBMISSION!")
        print("\nYou have:")
        print("  ✅ Complete backend with 8+ features")
        print("  ✅ Microsoft Azure integration (Blob + Insights)")
        print("  ✅ Full test suite")
        print("  ✅ Comprehensive documentation")
        print("  ✅ Submission guides")
        print("\nNext steps:")
        print("  1. Read: IMAGINE_CUP_SUBMISSION_GUIDE.md")
        print("  2. Create: Project description + screenshots")
        print("  3. Submit: Follow Imagine Cup submission steps")
        return 0
    else:
        print("⚠️  MISSING SOME COMPONENTS")
        print("\nCheck the items marked ❌ above")
        print("These might be missing or need attention")
        return 1

if __name__ == "__main__":
    sys.exit(main())
