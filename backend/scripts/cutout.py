import sys
from rembg import remove
from PIL import Image


def main():
    if len(sys.argv) < 3:
        print("Usage: python cutout.py <input_path> <output_path>", file=sys.stderr)
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2]

    input_image = Image.open(input_path)
    output_image = remove(input_image)
    output_image.save(output_path, "PNG")


if __name__ == "__main__":
    main()
