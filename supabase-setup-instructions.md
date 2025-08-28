# Configuration Supabase pour l'application de course

## 1. Créer un projet Supabase

1. Allez sur [https://supabase.com/](https://supabase.com/)
2. Créez un compte ou connectez-vous
3. Cliquez sur "New Project"
4. Choisissez un nom pour votre projet (ex: "running-app")
5. Définissez un mot de passe pour la base de données
6. Choisissez une région proche de vos utilisateurs

## 2. Obtenir les clés de configuration

1. Une fois le projet créé, allez dans **Settings > API**
2. Notez ces deux valeurs :
   - **Project URL** : `https://your-project-id.supabase.co`
   - **Anon/Public key** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 3. Créer le fichier .env

Créez un fichier `.env` à la racine du projet avec ce contenu :

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

⚠️ **Important** : Remplacez les valeurs par vos vraies clés !

## 4. Créer les tables dans Supabase

1. Dans votre projet Supabase, allez dans **SQL Editor**
2. Copiez et exécutez le contenu du fichier `supabase/migrations/001_initial_schema.sql`
3. Cela va créer toutes les tables nécessaires avec les bonnes permissions

## 5. Configurer le stockage (optionnel)

Pour les images de profil :

1. Allez dans **Storage** dans Supabase
2. Créez un nouveau bucket appelé `profile-images`
3. Définissez-le comme public
4. Configurez les politiques d'accès si nécessaire

## 6. Tester la connexion

Une fois configuré, l'application devrait :
- Se connecter automatiquement à Supabase
- Permettre l'inscription/connexion des utilisateurs
- Sauvegarder les courses dans le cloud
- Synchroniser les profils utilisateur

## 7. Migration des données existantes

Si vous avez déjà des données locales, elles seront progressivement migrées vers Supabase lors de la première connexion de chaque utilisateur.

## Fonctionnalités Supabase intégrées

- ✅ **Authentification** : Inscription, connexion, réinitialisation
- ✅ **Base de données** : Courses, profils, achievements, notifications
- ✅ **Stockage** : Images de profil
- ✅ **Sécurité** : Row Level Security (RLS)
- ✅ **Temps réel** : Synchronisation automatique
- ✅ **Offline** : Fonctionnement hors ligne avec sync

## Support

Si vous rencontrez des problèmes :
1. Vérifiez que les clés dans `.env` sont correctes
2. Assurez-vous que les tables sont créées
3. Consultez les logs de Supabase dans le dashboard







