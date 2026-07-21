import os
import subprocess
import sys

def run(cmd, ignore_error=False):
    print(f"\n> {cmd}")
    result = subprocess.run(cmd, shell=True)
    if result.returncode != 0 and not ignore_error:
        print(f"Lệnh thất bại với mã lỗi {result.returncode}")
        sys.exit(result.returncode)
    return result

if __name__ == "__main__":
    print("🚀 BẮT ĐẦU QUÁ TRÌNH RELEASE...")
    
    # 1. Chạy Commitizen để tự động tạo version mới và changelog
    print("\n--- 1. Tự động tăng version & tạo Changelog ---")
    bump_result = subprocess.run("cz bump", shell=True)
    
    if bump_result.returncode == 0:
        print("✅ Đã tạo version mới thành công!")
    else:
        print("⚠️ Không có commit nào cần tạo version mới (hoặc đã có lỗi). Tiếp tục push...")
    
    # 2. Push code và tags lên Github
    print("\n--- 2. Push code & tags lên Github ---")
    run("git push --follow-tags")
    
    # 3. Build file .ankiaddon
    print("\n--- 3. Build file .ankiaddon release ---")
    run("python scripts/build_release.py")
    
    print("\n🎉 HOÀN TẤT RELEASE THÀNH CÔNG! 🎉")
