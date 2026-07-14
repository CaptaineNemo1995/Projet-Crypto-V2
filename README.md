# CRYPTA — Cahier de Cryptographie Avancée

Une application web en deux volets sur un **moteur cryptographique écrit de zéro** :

- **Crypto Lab** — RSA et ElGamal sur de grands nombres (jusqu'à 2048 bits).
- **Élection** — chiffrement homomorphe de **Paillier** : chaque bulletin est chiffré, les
  chiffrés sont multipliés (mod n²), et un **seul déchiffrement** ne révèle que le total.

Aucune bibliothèque cryptographique externe : Miller–Rabin, exponentiation rapide
(square-and-multiply) et algorithme d'Euclide étendu sont implémentés à la main. Toute
l'arithmétique s'exécute **côté serveur (Python)**.

## Structure

```
backend/    API REST Flask + crypto_engine/ (number_theory, rsa, elgamal, paillier) + tests pytest
frontend/   application React (Vite + Tailwind) — design « cahier »
```

## Lancer le projet

Deux terminaux.

**1 · Backend** (port 5000)
```bash
cd backend
pip install -r requirements.txt      # première fois : flask, flask-cors, pytest
python app.py
```

**2 · Frontend** (port 5173, redirige /api → :5000)
```bash
cd frontend
npm install                          # première fois
npm run dev
```

Ouvrir http://localhost:5173.

## Tests

```bash
cd backend && python -m pytest tests/       # 19 tests — valide les vecteurs du TD
```

Vecteurs vérifiés : RSA (p=23, q=47, e=13), ElGamal (p=11, a=2, s=3, m=7 → y=8), le vecteur
Paillier du cours (p=13, q=17, g=4886, m=123, r=59 → c=13250 → 123) et le dépouillement
homomorphe des chiffrés 27275 / 27402 / 12991 (le produit se déchiffre en la somme, en un
seul déchiffrement).

## Parcours de démonstration

1. **Sommaire** → les trois parties du cahier.
2. **01 RSA** → générer des clés 2048 bits, chiffrer/déchiffrer, signer/vérifier.
3. **02 ElGamal** → charger le cas du TD (p=11, a=2, s=3, m=7), puis un aller-retour plus grand.
   Un `k` frais à chaque chiffrement.
4. **03 Élection** → créer l'élection, déposer 20 bulletins (raccourci démo = 13 oui / 7 non),
   le tableau public n'affiche que des chiffrés, le dépouillement révèle **13** en un seul déchiffrement.

Activez la **Trace de calcul** dans la barre latérale pour voir chaque valeur intermédiaire
(calculée sur le serveur) de la dernière opération.

## Remarques

- Le stockage est en mémoire (une élection active) ; redémarrer le backend le réinitialise.
- Les bulletins sont signés par RSA (réutilisant le RSA du Lab) ; le dépouillement écarte tout
  bulletin dont la signature est invalide.
