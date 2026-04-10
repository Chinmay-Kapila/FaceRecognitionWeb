import cv2

cap= cv2.VideoCapture(0)
face_cascade= cv2.CascadeClassifier('haarcascade_frontalface_alt.xml') #Face detection function (not built-in) and have to download the xml file from github

while True:
    ret, frame = cap.read()
    if ret == False:
        continue

    # gray_img = cv2.cvtColor(frame,cv2.COLOR_BGR2GRAY)
    
    # cv2.imshow('Gray Image',gray_img)

    faces = face_cascade.detectMultiScale(frame,1.3,5) #takes an image and takes a ratio and tells where the face is in that image with those ratios
    #1.3: scale factor (controls image resizing), 5: minimum neighbors (reduces false positives).
    
    print(faces) #will give that ratio rectangle in form of x,y,w,h where x,y is starting point and w,h is width,height 
    for (x,y,w,h) in faces:
        cv2.rectangle(frame,(x,y),(x+w,y+h),[255,0,0],2) #face pe rectangle of blue colour 

    cv2.imshow('Image',frame)
    key = cv2.waitKey(1)
    if key == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()