import pymssql
from hotqueue import HotQueue
from time import sleep
import json

server = "stg2circleo300.c1.stg"
user = "prosperdev"
password = "P@ssword25"
documentId = ""
baseDocumentURL = "https://support.stg2.circleone.com/Documents.ashx?I="
documentURL = ""

# Setup
conn = pymssql.connect(server, user, password, "Circleone")
queue = HotQueue("documentData", host="localhost", port=6379, db=0)
queue.clear()

# Initialization Code
while True:
    cursor = conn.cursor()
    sql = "select TOP 1 * from dbo.SubmittedDocument with (nolock) order by CreatedDate desc"
    cursor.execute(sql)
    results = cursor.fetchall()
    conn.commit()
    for row in results:
      if documentId != str(row[0]):
          documentId = str(row[0])
          print "Inside if: New document uploaded with document Id:" + documentId
          documentURL = baseDocumentURL + str(row[7].year) + "/" + str(row[7].month) + "/" + str(row[7].day) + "/" + str(row[22]) + "/" + str(row[2])
          data = {"documentId":documentId,"documentURL":documentURL}
          print json.dumps(data)
          queue.put(json.dumps(data))
    sleep(1)
