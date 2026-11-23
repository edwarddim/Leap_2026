import csv

def main():
    with open("reviews.csv", newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader)          # grab the header row
        for row in reader:
            platform, review_id, published_date, score, review_text = row
            print(f"Platform: {platform}, Score: {score}")


if __name__ == "__main__":
    main()
