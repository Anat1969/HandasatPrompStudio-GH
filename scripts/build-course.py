# Builds src/data/course.json from the content extracted from the Lovable app
# (docs/source/*.json) plus the level-999 layer: tracks, insights, fixes, missing exercises.
# Run: python3 scripts/build-course.py
import json, re, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
lessons = json.load(open(root / "docs/source/lessons.json", encoding="utf-8"))
exercises = json.load(open(root / "docs/source/exercises.json", encoding="utf-8"))

# Five floors of the course building, bottom to top.
TRACKS = [
    {"id": "base", "name": "יסודות השליטה", "q": "איך מדברים עם המכונה",
     "lead": "**הקשר**, **שאלה** ו**אימות**: שלושת הכלים שכל שיעור אחר נשען עליהם.",
     "lessons": [1, 7, 6, 11, 21]},
    {"id": "research", "name": "מחקר וידע", "q": "איך חושבים איתה",
     "lead": "מ**תשובה** אחת ל**לולאת משוב**, ממקור אחד ל**מאגר ידע** שמצטט.",
     "lessons": [3, 4, 5, 12, 20, 30]},
    {"id": "urban", "name": "עיר ומרחב", "q": "איך קוראים מקום",
     "lead": "רחוב, כיכר ושכונה נקראים ב**שכבות**: מי, מה, מתי ומה הכלל.",
     "lessons": [8, 14, 18, 19]},
    {"id": "tools", "name": "כלים ונכסים", "q": "איך ידע הופך לכלי",
     "lead": "משימה שחוזרת הופכת ל**תבנית**, ותבנית הופכת ל**נכס** שאחרים מפעילים.",
     "lessons": [2, 9, 10, 17]},
    {"id": "identity", "name": "זהות ופרקטיקה", "q": "איך זה נעשה שלך",
     "lead": "ה**DNA** האדריכלי שלך, הופך לכלי, לתכנית פעולה ולהמלצה מקצועית.",
     "lessons": [15, 16, 22, 23, 13]},
]

INSIGHT = {
    1: "הקשר קבוע שייך להגדרות, לא לשאלה.",
    2: "משימה שחוזרת היא סקריפט שמחכה.",
    3: "שותף מחקר נבנה בסבבי משוב.",
    4: "החומר מספר את הסיפור יותר מהצורה.",
    5: "מקורות שלך, תשובות עם הפניה.",
    6: "קודם המגבלה הטכנית, אחריה ההשראה.",
    7: "\"מה אם\" פותחת מה ש\"מה\" סוגרת.",
    8: "רחוב חי נמדד בקומת הקרקע.",
    9: "תבנית היא הנחיה עם פרמטרים.",
    10: "ידע שאפשר לשכפל הוא נכס.",
    11: "מבנה קבוע, פרמטרים משתנים.",
    12: "התובנה נמצאת בין המקורות.",
    13: "מילה אחרת יוצרת מרחב אחר.",
    14: "מרחב ציבורי נקרא בארבע שכבות.",
    15: "כלי קטן שחוסך שעה מנצח מערכת.",
    16: "ה-DNA שלך כבר בפרויקטים שלך.",
    17: "הגדרה עבודתית עדיפה על קונצנזוס.",
    18: "המתאם המפתיע פותח את התכנון.",
    19: "שאלה טובה מגדירה את העיר מחדש.",
    20: "המעגל החלש קובע את איכות המבנה.",
    21: "AI טועה בביטחון. אימות עוצר.",
    22: "בלי תאריך, תכנית נשארת רעיון.",
    23: "AI מנתח לחצים. האדריכל מחליט.",
    30: "עוזר טוב מצטט את המקור שלו.",
}

# Two lessons had no exercise in the original app (a generic placeholder was shown).
NEW_EX = {
    5: {
        "title": "NotebookLM כמנוע מחקר עם הפניות",
        "description": "בנה מחברת מחקר שעונה רק מתוך המקורות שלך, ובדוק את ההפניות.",
        "steps": [
            {"num": "01", "title": "צור מחברת", "desc": "פתח מחברת ב-NotebookLM והעלה 3 מקורות על נושא אחד: מאמר, תקן ותיק פרויקט.",
             "deliverable": "צילום מסך של המחברת עם 3 מקורות."},
            {"num": "02", "title": "שאל עם הפניה", "desc": "שאל 3 שאלות, ובדוק שכל תשובה מפנה למקום הנכון במקור.",
             "deliverable": "3 שאלות, 3 תשובות, וסימון לכל הפניה: נכונה או שגויה."},
            {"num": "03", "title": "השווה לצ'אט פתוח", "desc": "שאל את אותן שאלות בצ'אט כללי, בלי מקורות. מה ההבדל?",
             "deliverable": "טבלת השוואה: מחברת מול צ'אט כללי, בדיוק, בהפניות ובעומק."},
        ],
        "exampleSolution": "נושא: הצללה במבני חינוך. מקורות: מאמר מחקר, ת\"י 1045 ותיק הפרויקט. שאלה: 'איזו הצללה מתאימה לחזית מערבית?' המחברת ענתה עם הפניה לעמוד בתיק הפרויקט. הצ'אט הכללי ענה תשובה סבירה, אבל בלי מקור שאפשר לבדוק.",
        "faq": [
            {"question": "מה ההבדל בין NotebookLM לצ'אט רגיל?", "answer": "NotebookLM עונה מתוך המקורות שהעלית ומפנה אליהם. צ'אט רגיל עונה מהידע הכללי שלו."},
            {"question": "כמה מקורות כדאי להעלות בהתחלה?", "answer": "3 עד 5 מקורות ממוקדים בנושא אחד. מחברת מפוזרת נותנת תשובות מפוזרות."},
        ],
    },
    11: {
        "title": "הפרד מבנה מפרמטרים",
        "description": "פרק תהליך עבודה לחלק הקבוע ולחלק המשתנה, כדי שאותה הנחיה תעבוד בכל פרויקט.",
        "steps": [
            {"num": "01", "title": "פרק תהליך", "desc": "בחר תהליך עבודה, כמו פרוגרמה או ניתוח אתר, וכתוב את שלביו.",
             "deliverable": "רשימת שלבים של התהליך: 4 עד 7 שלבים."},
            {"num": "02", "title": "סמן קבוע ומשתנה", "desc": "סמן מה קבוע בכל פרויקט (מבנה), ומה משתנה (פרמטרים: מגרש, תקן, לקוח).",
             "deliverable": "טבלה: שלב, חלק קבוע, פרמטר משתנה."},
            {"num": "03", "title": "הרץ פעמיים", "desc": "הפעל את אותו מבנה עם שני סטים של פרמטרים. האם הפלט עקבי?",
             "deliverable": "שני פלטים זה לצד זה, והערה על העקביות."},
        ],
        "exampleSolution": "תהליך: פרוגרמה לגן ילדים. מבנה קבוע: שטחים, קשרים ודרישות. פרמטרים: מספר כיתות, גודל מגרש ועיר. הרצה עם 3 כיתות בבאר שבע ועם 6 כיתות באשדוד: אותו מבנה, פלט שונה ועקבי.",
        "faq": [
            {"question": "מה ההבדל בין השיעור הזה לשיעור 09?", "answer": "כאן מפרקים תהליך לקבוע ולמשתנה. בשיעור 09 אורזים אותו לתבנית מוכנה."},
            {"question": "כמה פרמטרים צריך?", "answer": "3 עד 5. פרמטר שלא משנה את הפלט מיותר."},
        ],
    },
}

# Standards cited with the wrong number in the original content.
# SI 1142 = railings and handrails; SI 1045 = thermal insulation of buildings.
FIXES = {
    1: [("תקן 1142, אקלים", "ת\"י 1045 (בידוד תרמי), אקלים"), ("מיקוד בתקן 1142", "מיקוד בת\"י 1045")],
    6: [("לפי תקן 1139", "לפי ת\"י 1142 (מעקות)")],
    21: [("בדוק: האם ההצעה עומדת בתקן 1142? בדיקת חימום יתר, יחס חלונות-קיר, כיוון.",
          "בדוק את ההצעה מול התקנים: ת\"י 1045 (בידוד תרמי) ות\"י 5282 (דירוג אנרגטי). יחס חלונות-קיר, הצללה, כיוון."),
         ("הצעת AI — חזית דרומית עם 60% זיגוג. בדיקה: תקן 1142 מגביל ל-40% בכיוון דרום. AI טעה!",
          "הצעת AI: חזית דרומית עם 60% זיגוג, 'לפי תקן 1142'. בדיקה: ת\"י 1142 עוסק במעקות, לא באנרגיה. AI ציטט תקן שגוי בביטחון מלא.")],
    30: [("(1142, 1139, 5281, נגישות)", "(1045, 1142, 5281, נגישות)")],
}

def undash(t):
    # מקף ארוך מהמקור: אחרי תווית קצרה הופך לנקודתיים, אחרת לפסיק
    def rep(m):
        before = re.split(r"[.:,!?]", t[:m.start()])[-1].split()
        return ": " if 0 < len(before) <= 3 else ", "
    return re.sub(r"\s+—\s+", rep, t)

def deep(o):
    if isinstance(o, str): return undash(o)
    if isinstance(o, list): return [deep(x) for x in o]
    if isinstance(o, dict): return {k: deep(v) for k, v in o.items()}
    return o

track_of = {n: tr["id"] for tr in TRACKS for n in tr["lessons"]}
assert sorted(track_of) == sorted(l["id"] for l in lessons), "every lesson in exactly one track"

out = []
for l in lessons:
    n = l["id"]
    ex = NEW_EX.get(n) or exercises[str(n)]
    ex = json.loads(json.dumps(ex, ensure_ascii=False))
    for a, b in FIXES.get(n, []):
        blob = json.dumps(ex, ensure_ascii=False)
        assert a.replace('"', '\\"') in blob or a in blob, (n, a)
        blob = blob.replace(a.replace('"', '\\"'), b.replace('"', '\\"'))
        ex = json.loads(blob)
    ex.pop("recordingUrl", None)  # example.com placeholders, not real recordings
    ex.pop("resources", None)
    ex["exampleSolution"] = re.sub(r"^דוגמה:\s*", "", ex["exampleSolution"])
    kicker, _, sub = l["title"].partition("<br>")
    minutes = int(re.search(r"(\d+) דק", l["meta"]).group(1))
    out.append({
        "id": n,
        "code": f"{n:02d}",
        "kicker": f"{kicker.strip()} · {sub.strip()}",
        "title": ex["title"].replace(" — ", ": "),
        "lead": l["description"],
        "insight": INSIGHT[n],
        "summary": ex["description"],
        "minutes": minutes,
        "tags": l["tags"],
        "track": track_of[n],
        "steps": ex["steps"],
        "example": ex["exampleSolution"],
        "faq": ex["faq"],
        "deck": n == 1,
    })

out = deep(out)
json.dump({"tracks": TRACKS, "lessons": out}, open(root / "src/data/course.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(len(out), "lessons")
