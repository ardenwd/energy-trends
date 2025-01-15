import csv

# Input and output file paths
input_file = 'data-center-elec-use.csv'  # Replace with your input file path
output_file = 'data-centers.csv'  # Replace with your desired output file path

# Read the CSV, remove the 4th and 5th columns, and write to a new file
with open(input_file, 'r') as infile:
    reader = csv.reader(infile)
    with open(output_file, 'w', newline='') as outfile:
        writer = csv.writer(outfile)
        for row in reader:
            # Remove the 4th and 5th columns (index 3 and 4, since indexing starts at 0)
            new_row = [col for i, col in enumerate(row) if i not in [3, 4]]
            writer.writerow(new_row)

print(f"Columns 4 and 5 have been removed. Output saved to {output_file}.")
