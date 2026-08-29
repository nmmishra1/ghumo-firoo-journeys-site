import os
from PIL import Image

def optimize_image(filepath, max_dim=1920, quality=85):
    try:
        orig_size = os.path.getsize(filepath)
        if orig_size < 250 * 1024:
            return 0, 0
        
        with Image.open(filepath) as img:
            orig_format = img.format
            w, h = img.size
            
            # Downscale if larger than max_dim
            if max(w, h) > max_dim:
                ratio = max_dim / max(w, h)
                new_w, new_h = int(w * ratio), int(h * ratio)
                img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
            
            # Check transparency
            has_alpha = False
            if img.mode in ('RGBA', 'LA'):
                alpha = img.split()[-1]
                if alpha.getextrema()[0] < 255:
                    has_alpha = True
            
            ext = os.path.splitext(filepath)[1].lower()
            temp_path = filepath + '.tmp'
            
            if ext in ('.jpg', '.jpeg'):
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                img.save(temp_path, format='JPEG', quality=quality, optimize=True, progressive=True)
            elif ext == '.png':
                if not has_alpha:
                    # Convert to RGB and save with optimize
                    rgb_img = img.convert('RGB')
                    rgb_img.save(temp_path, format='JPEG', quality=quality, optimize=True)
                else:
                    # PNG with transparency: convert to 8-bit adaptive palette or optimize
                    img.save(temp_path, format='PNG', optimize=True)
            elif ext == '.webp':
                img.save(temp_path, format='WEBP', quality=quality, method=6)
            else:
                return 0, 0
            
            new_size = os.path.getsize(temp_path)
            if new_size < orig_size:
                os.replace(temp_path, filepath)
                saved = orig_size - new_size
                print(f"Optimized: {filepath} ({orig_size/1024/1024:.2f}MB -> {new_size/1024:.1f}KB | -{saved/orig_size*100:.1f}%)")
                return orig_size, new_size
            else:
                if os.path.exists(temp_path):
                    os.remove(temp_path)
                return 0, 0
    except Exception as e:
        print(f"Error optimizing {filepath}: {e}")
        return 0, 0

def main():
    public_dir = 'public'
    total_orig = 0
    total_new = 0
    optimized_count = 0
    
    for root, dirs, files in os.walk(public_dir):
        for f in files:
            if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
                p = os.path.join(root, f)
                orig, new = optimize_image(p)
                if orig > 0:
                    total_orig += orig
                    total_new += new
                    optimized_count += 1
                    
    if total_orig > 0:
        total_saved = total_orig - total_new
        print(f"\n✅ Total images optimized: {optimized_count}")
        print(f"📦 Total size reduced from {total_orig/1024/1024:.2f} MB to {total_new/1024/1024:.2f} MB")
        print(f"🚀 Bandwidth saved: {total_saved/1024/1024:.2f} MB ({total_saved/total_orig*100:.1f}% reduction)")

if __name__ == '__main__':
    main()
