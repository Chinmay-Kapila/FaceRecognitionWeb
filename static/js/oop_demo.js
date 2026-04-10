// ============================================================
//  oop_demo.js  –  JavaScript OOP Concepts Demo
//  PURPOSE : Demonstrates Classes, Inheritance, Encapsulation.
//            This shows you know JavaScript OOP for viva.
//  NOTE    : This runs automatically when the Register page loads.
// ============================================================


// ══════════════════════════════════════════
//  BASE CLASS : Person
//  Represents a person with a name.
// ══════════════════════════════════════════
class Person {
  // Constructor runs when we do: new Person("Rahul")
  constructor(name) {
    this.name = name;           // Public property
    this._registeredAt = null;  // Convention: _ means "private"
  }

  // Method: describe this person
  greet() {
    return `Hello, I am ${this.name}.`;
  }

  // Getter (computed property)
  get registeredAt() {
    return this._registeredAt || 'Not registered yet';
  }
}


// ══════════════════════════════════════════
//  CHILD CLASS : FaceUser  (extends Person)
//  Adds face-data related properties.
//  This demonstrates INHERITANCE.
// ══════════════════════════════════════════
class FaceUser extends Person {
  constructor(name, frameCount = 0) {
    super(name);                // Call parent constructor
    this.frameCount = frameCount;
    this.isTrained  = false;
  }

  // Overrides parent's greet() – this is POLYMORPHISM
  greet() {
    return `Hi, I am ${this.name}. I have ${this.frameCount} face frames saved.`;
  }

  // Method to mark as trained
  train() {
    if (this.frameCount < 10) {
      return `❌ ${this.name} needs at least 10 frames to train.`;
    }
    this.isTrained       = true;
    this._registeredAt   = new Date().toLocaleString();
    return `✅ ${this.name} trained successfully at ${this._registeredAt}`;
  }

  // Static method: belongs to the class, not an instance
  static describe() {
    return 'FaceUser: A person whose face is stored in the database.';
  }
}


// ══════════════════════════════════════════
//  CLASS : FaceDatabase
//  Manages a list of FaceUsers.
//  Demonstrates ENCAPSULATION.
// ══════════════════════════════════════════
class FaceDatabase {
  #users = [];   // Private class field (ES2022)

  // Add a user to the database
  addUser(faceUser) {
    this.#users.push(faceUser);
    console.log(`[DB] Added user: ${faceUser.name}`);
  }

  // Get total user count
  get count() {
    return this.#users.length;
  }

  // Find user by name
  find(name) {
    return this.#users.find(u => u.name.toLowerCase() === name.toLowerCase()) || null;
  }

  // List all names
  listNames() {
    return this.#users.map(u => u.name);
  }
}


// ══════════════════════════════════════════
//  RUN DEMO IN BROWSER CONSOLE
// ══════════════════════════════════════════
const db   = new FaceDatabase();
const user1 = new FaceUser('Rahul', 35);
const user2 = new FaceUser('Priya', 5);

db.addUser(user1);
db.addUser(user2);

console.group('🧠 OOP Demo – Face Recognition System');
console.log('Static method:', FaceUser.describe());
console.log(user1.greet());
console.log(user2.greet());
console.log('Train Rahul :', user1.train());
console.log('Train Priya :', user2.train());
console.log('DB count    :', db.count);
console.log('All users   :', db.listNames());
console.log('Find Rahul  :', db.find('rahul')?.greet());
console.groupEnd();

// Export for potential module use
// (Not required for browser script tag usage)
