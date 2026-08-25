import sqlite3
import os
import csv

raw_data = """Updated PAWAN SOREN: Father(SATISH SOREN -> SATISH SOREN), Mother(TALOMUNI DEVI -> TALOMUNI DEVI)
Updated SUGANDHA KUMARI: Father(MIRHRI YADAV -> MIRHRI YADAV), Mother(RINKU DEVI -> RINKU DEVI)
Updated SHASHI KUMAR: Father(SANDEEP KUMAR -> SANDEEP KUMAR), Mother(HEMANTI DEVI -> HEMANTI DEVI)
Updated PRIYANKA KUMARI: Father(MANOJ KUMAR -> MANOJ KUMAR), Mother(MALTI DEVI -> MALTI DEVI)
Updated DEEPAK SOREN: Father(MANGRA SOREN -> MANGRA SOREN), Mother(MANTI HEMBROM -> MANTI HEMBROM)
Updated LAKSHYA KUMAR: Father(VIKASH KUMAR -> VIKASH KUMAR), Mother(PUNAM DEVI -> PUNAM DEVI)
Updated KARTIK MUNDA: Father(MITHUN MUNDA -> MITHUN MUNDA), Mother(ANITA DEVI -> ANITA DEVI)
Updated FARHAN RIYAZ: Father(ANSAM ANSARI -> ANSAM ANSARI), Mother(ISRAT PARWEEN -> ISRAT PARWEEN)
Updated AYAAN AHMAD: Father(MD.IQBAL -> MD.IQBAL), Mother(NAGMA NIGAR -> NAGMA NIGAR)
Updated ARSH ZIGAR: Father(MD. ROSHAN JAMIR ANSARI -> MD. ROSHAN JAMIR ANSARI), Mother(CHAND BANO -> CHAND BANO)
Updated PAAKIZA MEHAR: Father(MUSTAKIM ANSARI -> MUSTAKIM ANSARI), Mother(TARANUM ARA -> TARANUM ARA)
Updated REHAN ANSARI: Father(MD. HABISH -> MD. HABISH), Mother(ZENNAT PARWEEN -> ZENNAT PARWEEN)
Updated PRIYANSH RAJ: Father(UPENDRA RIJVANSHI -> UPENDRA RIJVANSHI), Mother(NILOO DEVI -> NILOO DEVI)
Updated RAKHI KUMARI: Father(MANOJ KUMAR -> MANOJ KUMAR), Mother(ANITA DEVI -> ANITA DEVI)
Updated MAHI KUMARI: Father(NASIB CHOUHAN -> NASIB CHOUHAN), Mother(SONI DEVI -> SONI DEVI)
Updated AYAN KUMAR: Father(ANGAD KUMAR -> ANGAD KUMAR), Mother(ANJALI DEVI -> ANJALI DEVI)
Updated AYAT PARWEEN: Father(NADIR SIDDIQUE -> NADIR SIDDIQUE), Mother(RUKHSANA PARWEEN -> RUKHSANA PARWEEN)
Updated RAGINI KUMARI: Father(DIESH YADAV -> DIESH YADAV), Mother(BABITA -> BABITA)
Updated SHIFA NAAZ: Father(RIYAZ ANSARI -> RIYAZ ANSARI), Mother(SABNAM KHATOON -> SABNAM KHATOON)
Updated CHANCHAL KUMARI: Father(PANKAJ KUMAR -> PANKAJ KUMAR), Mother(MANISHA DEVI -> MANISHA DEVI)
Updated SADAB ANSARI: Father(MD. MERAJ ANASRI -> MD. MERAJ ANASRI), Mother(SHAHNAZ PARWEEN -> SHAHNAZ PARWEEN)
Updated SANDHYA KUMARI: Father(SHIVA KARMALI -> SHIVA KARMALI), Mother(SUNITA DEVI -> SUNITA DEVI)
Updated LAXMI KUMARI: Father(BINOD CHOHAN -> BINOD CHOHAN), Mother(ANITA DEVI -> ANITA DEVI)
Updated KRITI KUMARI: Father(000 -> JITAN NAYAK), Mother(00 -> ASHA)
Updated SIYA KUMARI: Father(AMBARISH KUMAR -> AMBARISH KUMAR), Mother(KAUSHALYA KUMARI -> KAUSHALYA KUMARI)
Updated JANU KUMAR: Father(P -> P), Mother(P -> P)
Updated DIVYANSH KUMAR: Father(SANJAY KUMAR -> SANJAY KUMAR), Mother(RANI KUMARI -> RANI KUMARI)
Updated SUMAIRA NAAZ: Father(MANAWAR HUSAN -> MANAWAR HUSAN), Mother(CHANDANI NAAZ -> CHANDANI NAAZ)
Updated VAISHNAVI KUMARI: Father(JETENDRA CHOUHAN -> JETENDRA CHOUHAN), Mother(SONI DEVI -> SONI DEVI)
Updated SHOURYA KUMAR: Father(UDAY KUMAR CHOUHAN -> UDAY KUMAR CHOUHAN), Mother(PARMILA DEVI -> PARMILA DEVI)
Updated RAVI RAJ: Father(VIJAY MATHO -> VIJAY MATHO), Mother(SONAM DEVI -> SONAM DEVI)
Updated PREM SAGAR: Father(AMBRISH KUMAR -> AMBRISH KUMAR), Mother(KAUSHLYA KUMARI -> KAUSHLYA KUMARI)
Updated ANANYA MURMU: Father(0 -> RAJU MANJHI), Mother(0 -> SARASWATI DEVI)
Updated NISHANT KUMAR: Father(RAJU TURI -> RAJU TURI), Mother(SUGANTI DEVI -> SUGANTI DEVI)
Updated PIYUSH KUMAR: Father(LATE UPENDRA SAW -> LATE UPENDRA SAW), Mother(NITU DEVI -> NITU DEVI)
Updated AYUSH KUMAR: Father(HIRALAL SAW -> HIRALAL SAW), Mother(KIRAN DEVI -> KIRAN DEVI)
Updated AYAN RAZA: Father(MANJUR ANSARI -> MANJUR ANSARI), Mother(JAMILA KHATOON -> JAMILA KHATOON)
Updated RUHAN HASAN: Father(HASAN RAZA -> HASAN RAZA), Mother(RUBI PARWEEN -> RUBI PARWEEN)
Updated RAKHI KUMARI: Father(RAJU TURI -> RAJU TURI), Mother(00 -> SUGANTI DEVI)
Updated MAHI KUMARI: Father(MUKESH MODI -> MUKESH MODI), Mother(RENU DEVI -> RENU DEVI)
Updated MAYANK KUMAR: Father(SAMBHU PARJAPATI -> SAMBHU PARJAPATI), Mother(PARTIMA DEVI -> PARTIMA DEVI)
Updated SHIFA NAAZ: Father(SAWOOD ANSHRI -> SAWOOD ANSHRI), Mother(SALIMA KHATOON -> SALIMA KHATOON)
Updated RAFIYA NAAZ: Father(SAFFAR ANSARI -> SAFFAR ANSARI), Mother(KHADIZA KHATOON -> KHADIZA KHATOON)
Updated ANGIRA KUMARI: Father(SHIV KUMAR -> SHIV KUMAR), Mother(SUNITA DEVI -> SUNITA DEVI)
Updated SIYA KUMARI: Father(00 -> RAJESH TURI), Mother(00 -> SHILA DEVI)
Updated KARAN SOREN: Father(TALO SORAN -> TALO SORAN), Mother(DHENI TUDU -> DHENI TUDU)
Updated PIYUSH KUMAR: Father(SIKANDAR KUMAR -> SIKANDAR KUMAR), Mother(REKHA KUMARI -> REKHA KUMARI)
Updated MONISH RAZA: Father(MUSTAIQUUM ANSARI -> MUSTAIQUUM ANSARI), Mother(TARRANNUM ARA -> TARRANNUM ARA)
Updated KRITIGYA TOPPO: Father(SHIV KUMAR TOPPO -> SHIV KUMAR TOPPO), Mother(SONI TOPPO -> SONI TOPPO)
Updated AYAT PARWEEN: Father(MANNU ALAM -> MANNU ALAM), Mother(HALIMA KHATOON -> HALIMA KHATOON)
Updated MD REHAN ANSARI: Father(AHSAAN ANSARI -> AHSAAN ANSARI), Mother(ISRAT PARWEEN -> ISRAT PARWEEN)"""

db_path = os.path.join(os.path.expanduser('~'), 'AppData', 'Roaming', 'school-management-system', 'school.db')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get a mapping of fullName to className
cursor.execute("SELECT fullName, className FROM students")
db_students = cursor.fetchall()

class_map = {}
for s in db_students:
    full_name = s[0]
    class_name = s[1]
    if full_name:
        class_map[str(full_name).upper().strip()] = class_name

import re

out_path = r"C:\Users\Admin\Desktop\School Work\Apaar data\Updated_Students_With_Class.csv"
with open(out_path, 'w', newline='', encoding='utf-8') as f:
    writer = csv.writer(f)
    writer.writerow(['Student Name', 'Class', 'Old Father Name', 'New Father Name', 'Old Mother Name', 'New Mother Name'])
    
    for line in raw_data.strip().split('\n'):
        match = re.match(r"^Updated (.*?): Father\((.*?) -> (.*?)\), Mother\((.*?) -> (.*?)\)$", line.strip())
        if match:
            s_name = match.group(1).upper().strip()
            o_f = match.group(2)
            n_f = match.group(3)
            o_m = match.group(4)
            n_m = match.group(5)
            
            s_class = class_map.get(s_name, "Unknown Class")
            writer.writerow([s_name, s_class, o_f, n_f, o_m, n_m])

print(f"Successfully wrote {out_path}")
conn.close()
