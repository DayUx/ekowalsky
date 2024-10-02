# Utiliser une image de Node.js
FROM node:20

# Installer les dépendances
RUN mkdir /app
COPY package*.json ./
RUN cd /app && npm install

# Exposer le port de l'application
EXPOSE 3000

WORKDIR /app

# Commande pour démarrer l'application
CMD ["npm", "run", "start"]