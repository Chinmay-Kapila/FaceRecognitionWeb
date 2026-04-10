import cv2
import numpy as np

cap = cv2.VideoCapture(0)
face_cascade = cv2.CascadeClassifier("haarcascade_frontalface_alt.xml")

face_data = [] #list to store captured face images.
name = input("Enter the name of the Person: ")
count = 0 #counts frames captured from webcam.

while True:
    
    ret, frame = cap.read()
    if ret == False:
        continue

    # gray_img = cv2.cvtColor(frame,cv2.COLOR_BGR2GRAY)
    # cv2.imshow('Gray Image',gray_img)
    # print(1)
    faces = face_cascade.detectMultiScale(frame,1.3,5)
    for (x,y,w,h) in faces:
        cv2.rectangle(frame,(x,y),(x+w,y+h),[255,0,0],2)

    cv2.imshow('Image',frame)
    if len(faces) == 0:
        continue #If no faces are detected, it goes to the next frame.
    
    face = sorted(faces,key = lambda f: f[2]*f[3])[-1] #Sorts detected faces by area (width × height) and Picks the largest face (assumes it's closest to the camera)
    x,y,w,h = face
    offset = 10 #small margin for more accuracy 
    face_img = frame[y-offset:y+h+offset, x-offset:x+w+offset]
    face_img = cv2.resize(face_img,(100,100)) #Resizes face image to 100×100 pixels (uniform size for training)
    cv2.imshow('Face Image',face_img) #displays the cropped image of face
    
    if count%10 == 0:
        face_data.append(face_img) #Saves every 10th frame to avoid duplicate images and also captures variation
    count += 1 
    
    key = cv2.waitKey(1)
    if key == ord('q'):
        break

face_data = np.array(face_data) 
face_data = face_data.reshape((face_data.shape[0],-1)) #Flattens each image from (100,100,3) -> (30000,)
print(face_data.shape) # (no. of faces, 30000)

# Save this data into file system
np.save('./data/'+name+'.npy',face_data) #important for face recoginition training and .npy important extension
print("Data Successfully saved")


cap.release()
cv2.destroyAllWindows()  
