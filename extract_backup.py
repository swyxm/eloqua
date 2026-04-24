import re
import csv
import sys
import os

def extract_copy_data(backup_file, out_dir):
    if not os.path.exists(out_dir):
        os.makedirs(out_dir)

    with open(backup_file, 'r', encoding='utf-8') as f:
        in_copy_block = False
        current_table = None
        columns = []
        writer = None
        csv_file = None

        for line in f:
            if line.startswith('COPY public.'):
                # e.g. COPY public.tournaments (id, name) FROM stdin;
                match = re.match(r'COPY public\.(\w+) \((.*?)\)', line)
                if match:
                    current_table = match.group(1)
                    columns = [c.strip().strip('"') for c in match.group(2).split(',')]
                    in_copy_block = True
                    csv_path = os.path.join(out_dir, f"{current_table}.csv")
                    csv_file = open(csv_path, 'w', newline='', encoding='utf-8')
                    writer = csv.writer(csv_file)
                    writer.writerow(columns)
                continue
            
            if in_copy_block:
                if line.strip() == '\\.':
                    in_copy_block = False
                    if csv_file:
                        csv_file.close()
                else:
                    # PostgreSQL COPY output is tab separated
                    # Nulls are represented as \N
                    row = line.rstrip('\n').split('\t')
                    row = [None if val == '\\N' else val for val in row]
                    if writer:
                        writer.writerow(row)

if __name__ == '__main__':
    extract_copy_data("db_cluster-22-09-2025@05-22-40.backup", "extracted_data")
